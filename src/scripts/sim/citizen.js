import { CommercialZone } from './buildings/zones/commercial.js';
import { IndustrialZone } from './buildings/zones/industrial.js';
import { ResidentialZone } from './buildings/zones/residential.js';
import { CitizenNeeds } from './citizenNeeds.js';
import { getRandomProfessionForBuilding, getQualifiedProfessions } from './profession.js';
import { DailySchedule, CitizenDecisionTree } from './citizenActivity.js';
import config from '../config.js';

export class Citizen {
  /**
   * @param {ResidentialZone} residence 
   */
  constructor(residence) {
    /**
     * Unique identifier for the citizen
     * @type {string}
     */
    this.id = crypto.randomUUID();

    /**
     * Name of this citizen
     * @type {string}
     */
    this.name = generateRandomName();

    /**
     * Age of the citizen in years
     * @type {number}
     */
    this.age = 1 + Math.floor(100*Math.random());

    /**
     * The current state of the citizen
     * @type {'idle' | 'school' | 'employed' | 'unemployed' | 'retired'}
     */
    this.state = 'idle';

    /**
     * Number of simulation steps in the current state
     */
    this.stateCounter = 0;

    /**
     * Reference to the building the citizen lives at
     * @type {ResidentialZone}
     */
    this.residence = residence;

    /**
     * Reference to the building the citizen works at
     * @type {CommercialZone | IndustrialZone}
     */
    this.workplace = null;

    /**
     * Citizen's profession/job
     * @type {Profession | null}
     */
    this.profession = null;

    /**
     * Monthly salary from profession
     * @type {number}
     */
    this.salary = 0;

    /**
     * Citizen's needs (health, safety, education, happiness)
     * @type {CitizenNeeds}
     */
    this.needs = new CitizenNeeds(this);

    /**
     * Daily schedule and activities
     * @type {DailySchedule}
     */
    this.schedule = new DailySchedule(this);

    /**
     * Current activity
     * @type {string}
     */
    this.currentActivity = 'IDLE';

    /**
     * Current 3D position (for visual representation)
     * @type {{x: number, y: number}}
     */
    this.position = { x: residence.x, y: residence.y };

    /**
     * Target position (where citizen is heading)
     * @type {{x: number, y: number}}
     */
    this.targetPosition = { x: residence.x, y: residence.y };

    /**
     * Movement progress (0-1) between current and target position
     * @type {number}
     */
    this.movementProgress = 1.0;

    this.#initializeState();
  }

  /**
   * Sets the initial state of the citizen
   */
  #initializeState() {
    if (this.age < config.citizen.minWorkingAge) {
      this.state = 'school';
    } else if (this.age >= config.citizen.retirementAge) {
      this.state = 'retired';
    } else {
      this.state = 'unemployed';
    }
  }

  /**
   * Steps the state of the citizen forward in time by one simulation step
   * @param {object} city
   */
  simulate(city) {
    // Update needs every simulation step
    this.needs.decay();

    // Get current activity from schedule (with safety checks)
    const currentHour = city.timeManager?.currentHour || 8;
    const timeOfDay = city.timeManager?.getTimeOfDay() || 'day';
    const activity = this.schedule?.getCurrentActivity(currentHour);

    // Make autonomous decisions based on context
    const context = {
      currentHour,
      timeOfDay,
      activity: activity?.type
    };

    const previousActivity = this.currentActivity;
    const decision = CitizenDecisionTree.decide(this, context);
    if (decision) {
      this.currentActivity = decision;

      // If activity changed, update target position
      if (previousActivity !== this.currentActivity) {
        this.#updateTargetPosition();
      }
    }

    // Update movement progress
    this.#updateMovement();

    // Check if should change jobs (weekly decision)
    if (city.timeManager?.currentDay % 7 === 0 && city.timeManager?.currentHour === 12) {
      if (CitizenDecisionTree.shouldChangeJobs(this)) {
        // Quit current job and search for new one
        if (this.workplace) {
          this.workplace.jobs.workers = this.workplace.jobs.workers.filter(w => w !== this);
          this.workplace = null;
          this.profession = null;
          this.state = 'unemployed';
        }
      }
    }

    // Original state machine (enhanced with schedule awareness)
    switch (this.state) {
      case 'idle':
      case 'school':
      case 'retired':
        // Action - Follow schedule
        // Transitions - None
        break;

      case 'unemployed':
        // Action - Look for a job
        this.workplace = this.#findJob(city);

        // Transitions
        if (this.workplace) {
          this.state = 'employed';
          this.schedule.update(); // Update schedule with new job
        }

        break;

      case 'employed':
        // Actions - None

        // Transitions
        if (!this.workplace) {
          this.state = 'unemployed';
          this.schedule.update(); // Update schedule without job
        }

        break;

      default:
        console.error(`Citizen ${this.id} is in an unknown state (${this.state})`);
    }
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    // Remove resident from its  workplace
    const workerIndex = this.workplace?.jobs.workers.indexOf(this);

    if (workerIndex !== undefined && workerIndex > -1) {
      this.workplace.jobs.workers.splice(workerIndex);
    }
  }

  /**
   * Search for a job nearby
   * @param {object} city
   * @returns
   */
  #findJob(city) {
    // Get professions this citizen qualifies for
    const qualifiedProfessions = getQualifiedProfessions(this);

    if (qualifiedProfessions.length === 0) {
      // Not qualified for any jobs - need more education
      return null;
    }

    const tile = city.findTile(this.residence, (tile) => {
      // Search for buildings with available jobs
      if (tile.building?.type === 'industrial' ||
          tile.building?.type === 'commercial') {
        if (tile.building.jobs.availableJobs > 0) {
          return true;
        }
      }

      return false;
    }, config.citizen.maxJobSearchDistance);

    if (tile) {
      // Assign a profession based on building type and qualifications
      const buildingType = tile.building.type;
      const availableProfessions = qualifiedProfessions.filter(
        p => p.buildingType === buildingType ||
             p.buildingType === 'commercial' ||
             p.buildingType === 'industrial'
      );

      if (availableProfessions.length > 0) {
        // Pick the best paying job they qualify for
        availableProfessions.sort((a, b) => b.baseSalary - a.baseSalary);
        this.profession = availableProfessions[0];
        this.salary = this.profession.baseSalary;
      } else {
        // Fallback to generic job
        this.profession = null;
        this.salary = 2500; // Minimum wage
      }

      // Employ the citizen at the building
      tile.building.jobs.workers.push(this);
      return tile.building;
    } else {
      return null;
    }
  }

  /**
   * Sets the workplace for the citizen
   * @param {CommercialZone | IndustrialZone} workplace
   */
  setWorkplace(workplace) {
    this.workplace = workplace;
    if (!workplace) {
      this.profession = null;
      this.salary = 0;
    }
  }

  /**
   * Update target position based on current activity
   */
  #updateTargetPosition() {
    let targetBuilding = this.residence;

    switch (this.currentActivity) {
      case 'WORK':
      case 'GO_TO_WORK':
        targetBuilding = this.workplace || this.residence;
        break;

      case 'GO_HOME':
      case 'SLEEP_AT_HOME':
      case 'EAT_AT_HOME':
      case 'STAY_HOME':
      case 'IDLE':
      default:
        targetBuilding = this.residence;
        break;
    }

    if (targetBuilding && targetBuilding.x !== undefined && targetBuilding.y !== undefined) {
      this.targetPosition = {
        x: targetBuilding.x,
        y: targetBuilding.y
      };

      // Reset movement progress when target changes
      this.movementProgress = 0;
    }
  }

  /**
   * Update movement toward target position
   */
  #updateMovement() {
    if (this.movementProgress < 1.0) {
      // Movement speed: 0.02 = 50 simulation steps to complete journey
      const speed = 0.02;
      this.movementProgress = Math.min(1.0, this.movementProgress + speed);

      // Interpolate position
      this.position.x = this.position.x + (this.targetPosition.x - this.position.x) * speed / (1 - this.movementProgress + speed);
      this.position.y = this.position.y + (this.targetPosition.y - this.position.y) * speed / (1 - this.movementProgress + speed);
    } else {
      // Arrived at destination
      this.position.x = this.targetPosition.x;
      this.position.y = this.targetPosition.y;
    }
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    const professionDisplay = this.profession ?
      `${this.profession.name} ($${this.salary.toLocaleString()}/mo)` :
      this.state;

    // Format current activity for display (with safety check)
    let activityDisplay = 'Idle';
    let activityEmoji = '💤';

    if (this.currentActivity) {
      activityDisplay = this.currentActivity
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Activity emoji mapping
      const emojiMap = {
        'SLEEP_AT_HOME': '😴',
        'GO_TO_WORK': '🚶',
        'WORK': '💼',
        'GO_HOME': '🚶',
        'GO_TO_LIBRARY': '📚',
        'GO_TO_PARK': '🌳',
        'SOCIALIZE': '👥',
        'GO_SHOPPING': '🛒',
        'EAT_AT_HOME': '🍽️',
        'GO_TO_HOSPITAL': '🏥',
        'STAY_HOME': '🏠',
        'SEEK_HEALTHCARE': '⚕️',
        'SEEK_SAFETY': '🚨',
        'IDLE': '💤'
      };
      activityEmoji = emojiMap[this.currentActivity] || '📍';
    }

    return `
      <li class="info-citizen">
        <span class="info-citizen-name">${this.name}</span>
        <br>
        <span class="info-citizen-details">
          <span>
            <img class="info-citizen-icon" src="/icons/calendar.png">
            ${this.age}
          </span>
          <span>
            <img class="info-citizen-icon" src="/icons/job.png">
            ${professionDisplay}
          </span>
        </span>
        <div style="margin-top: 5px; font-size: 0.85em; color: #aaffaa;">
          ${activityEmoji} ${activityDisplay}
        </div>
        <div style="margin-top: 5px; font-size: 0.9em;">
          ${this.needs.toHTML()}
        </div>
      </li>
    `;
  }
}

function generateRandomName() {
  const firstNames = [
    'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella',
    'Liam', 'Noah', 'William', 'James', 'Benjamin',
    'Elizabeth', 'Margaret', 'Alice', 'Dorothy', 'Eleanor',
    'John', 'Robert', 'William', 'Charles', 'Henry',
    'Alex', 'Taylor', 'Jordan', 'Casey', 'Robin'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Jones', 'Brown',
    'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
    'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
    'Clark', 'Lewis', 'Walker', 'Hall', 'Young',
    'Lee', 'King', 'Wright', 'Adams', 'Green'
  ];

  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return randomFirstName + ' ' + randomLastName;
}