/**
 * Defines citizen activities and daily routines
 * Implements "Daily Loop" from Digital City Twin architecture
 */

/**
 * Activity types for citizens
 */
export const ActivityType = {
  SLEEPING: 'sleeping',
  COMMUTING_TO_WORK: 'commuting_to_work',
  WORKING: 'working',
  COMMUTING_HOME: 'commuting_home',
  LEISURE: 'leisure',
  SHOPPING: 'shopping',
  EATING: 'eating',
  SEEKING_HEALTHCARE: 'seeking_healthcare',
  AT_HOME: 'at_home',
  IDLE: 'idle'
};

/**
 * Represents a scheduled activity for a citizen
 */
export class Activity {
  /**
   * @param {string} type - Activity type
   * @param {number} startHour - Starting hour (0-23)
   * @param {number} duration - Duration in hours
   * @param {object} location - Location coordinates or building reference
   */
  constructor(type, startHour, duration, location = null) {
    this.type = type;
    this.startHour = startHour;
    this.duration = duration;
    this.location = location;
  }

  /**
   * Get end hour of activity
   * @returns {number}
   */
  get endHour() {
    return (this.startHour + this.duration) % 24;
  }

  /**
   * Check if activity is active at given hour
   * @param {number} hour
   * @returns {boolean}
   */
  isActiveAt(hour) {
    if (this.startHour + this.duration <= 24) {
      return hour >= this.startHour && hour < this.endHour;
    } else {
      // Activity spans midnight
      return hour >= this.startHour || hour < this.endHour;
    }
  }
}

/**
 * Manages citizen's daily schedule
 */
export class DailySchedule {
  /**
   * @param {Citizen} citizen
   */
  constructor(citizen) {
    this.citizen = citizen;
    this.activities = [];
    this.currentActivity = null;
    this.generateSchedule();
  }

  /**
   * Generate daily schedule based on citizen's role and needs
   */
  generateSchedule() {
    this.activities = [];

    const age = this.citizen.age;
    const hasJob = this.citizen.workplace !== null;
    const isChild = age < 18;
    const isRetired = age >= 65;

    if (isChild) {
      // Children's schedule
      this.activities.push(new Activity(ActivityType.SLEEPING, 22, 10)); // 10 PM - 8 AM
      this.activities.push(new Activity(ActivityType.AT_HOME, 8, 1)); // 8 AM - 9 AM (breakfast)
      this.activities.push(new Activity(ActivityType.COMMUTING_TO_WORK, 9, 0.5)); // School commute
      this.activities.push(new Activity(ActivityType.WORKING, 9.5, 6)); // School 9:30 AM - 3:30 PM
      this.activities.push(new Activity(ActivityType.COMMUTING_HOME, 15.5, 0.5));
      this.activities.push(new Activity(ActivityType.LEISURE, 16, 3)); // Play/homework
      this.activities.push(new Activity(ActivityType.EATING, 19, 1)); // Dinner
      this.activities.push(new Activity(ActivityType.AT_HOME, 20, 2)); // Evening at home
    } else if (isRetired) {
      // Retired schedule - more flexible
      this.activities.push(new Activity(ActivityType.SLEEPING, 22, 8)); // 10 PM - 6 AM
      this.activities.push(new Activity(ActivityType.AT_HOME, 6, 2)); // Morning routine
      this.activities.push(new Activity(ActivityType.LEISURE, 8, 3)); // Morning activities
      this.activities.push(new Activity(ActivityType.SHOPPING, 11, 1));
      this.activities.push(new Activity(ActivityType.EATING, 12, 1)); // Lunch
      this.activities.push(new Activity(ActivityType.LEISURE, 13, 4)); // Afternoon activities
      this.activities.push(new Activity(ActivityType.EATING, 17, 1)); // Dinner
      this.activities.push(new Activity(ActivityType.AT_HOME, 18, 4)); // Evening
    } else if (hasJob) {
      // Working adult schedule
      this.activities.push(new Activity(ActivityType.SLEEPING, 23, 7)); // 11 PM - 6 AM
      this.activities.push(new Activity(ActivityType.AT_HOME, 6, 2)); // Morning routine
      this.activities.push(new Activity(ActivityType.COMMUTING_TO_WORK, 8, 0.5));
      this.activities.push(new Activity(ActivityType.WORKING, 8.5, 8)); // 8:30 AM - 4:30 PM
      this.activities.push(new Activity(ActivityType.COMMUTING_HOME, 16.5, 0.5));
      this.activities.push(new Activity(ActivityType.SHOPPING, 17, 1)); // Errands after work
      this.activities.push(new Activity(ActivityType.EATING, 18, 1)); // Dinner
      this.activities.push(new Activity(ActivityType.LEISURE, 19, 3)); // Evening leisure
      this.activities.push(new Activity(ActivityType.AT_HOME, 22, 1)); // Pre-sleep
    } else {
      // Unemployed adult schedule
      this.activities.push(new Activity(ActivityType.SLEEPING, 23, 8)); // 11 PM - 7 AM
      this.activities.push(new Activity(ActivityType.AT_HOME, 7, 2));
      this.activities.push(new Activity(ActivityType.LEISURE, 9, 3)); // Job searching, activities
      this.activities.push(new Activity(ActivityType.EATING, 12, 1)); // Lunch
      this.activities.push(new Activity(ActivityType.LEISURE, 13, 4));
      this.activities.push(new Activity(ActivityType.EATING, 17, 1)); // Dinner
      this.activities.push(new Activity(ActivityType.AT_HOME, 18, 5)); // Evening
    }

    // Add health-seeking activity if health is low
    if (this.citizen.needs && this.citizen.needs.health < 30) {
      // Replace some leisure time with healthcare
      this.activities.push(new Activity(ActivityType.SEEKING_HEALTHCARE, 14, 2));
    }
  }

  /**
   * Get current activity based on time
   * @param {number} currentHour
   * @returns {Activity | null}
   */
  getCurrentActivity(currentHour) {
    for (const activity of this.activities) {
      if (activity.isActiveAt(currentHour)) {
        return activity;
      }
    }
    return new Activity(ActivityType.IDLE, currentHour, 1);
  }

  /**
   * Update schedule (e.g., when citizen gets/loses job)
   */
  update() {
    this.generateSchedule();
  }
}

/**
 * Decision tree for citizen choices
 */
export class CitizenDecisionTree {
  /**
   * Make a decision for citizen based on current context
   * @param {Citizen} citizen
   * @param {object} context - Context information (time, location, needs)
   * @returns {string} Decision result
   */
  static decide(citizen, context) {
    const needs = citizen.needs;
    const timeOfDay = context.timeOfDay;

    // Critical needs override schedule
    if (needs.health < 20) {
      return 'SEEK_HEALTHCARE';
    }

    if (needs.safety < 20) {
      return 'SEEK_SAFETY';
    }

    // Follow schedule for normal conditions
    const activity = citizen.schedule?.getCurrentActivity(context.currentHour);

    if (!activity) {
      return 'IDLE';
    }

    switch (activity.type) {
      case ActivityType.SLEEPING:
        return 'SLEEP_AT_HOME';

      case ActivityType.COMMUTING_TO_WORK:
        if (citizen.workplace) {
          return 'GO_TO_WORK';
        }
        return 'IDLE';

      case ActivityType.WORKING:
        return 'WORK';

      case ActivityType.COMMUTING_HOME:
        return 'GO_HOME';

      case ActivityType.LEISURE:
        // Choose leisure based on needs
        if (needs.education < 50) {
          return 'GO_TO_LIBRARY';
        }
        if (needs.happiness < 50) {
          return 'GO_TO_PARK';
        }
        return 'SOCIALIZE';

      case ActivityType.SHOPPING:
        return 'GO_SHOPPING';

      case ActivityType.EATING:
        return 'EAT_AT_HOME';

      case ActivityType.SEEKING_HEALTHCARE:
        return 'GO_TO_HOSPITAL';

      case ActivityType.AT_HOME:
        return 'STAY_HOME';

      default:
        return 'IDLE';
    }
  }

  /**
   * Evaluate if citizen should change jobs
   * @param {Citizen} citizen
   * @returns {boolean}
   */
  static shouldChangeJobs(citizen) {
    if (!citizen.workplace) return false;

    // Change jobs if:
    // 1. Happiness is very low
    if (citizen.needs.happiness < 30) {
      return Math.random() < 0.1; // 10% chance per day
    }

    // 2. Better opportunities available (check education vs current job)
    if (citizen.profession && citizen.needs.education > citizen.profession.educationRequired + 20) {
      return Math.random() < 0.05; // 5% chance to seek better job
    }

    return false;
  }

  /**
   * Evaluate if citizen should move to different residence
   * @param {Citizen} citizen
   * @returns {boolean}
   */
  static shouldRelocate(citizen) {
    // Move if happiness has been low for extended period
    if (citizen.needs.happiness < 25) {
      return Math.random() < 0.02; // 2% chance per day
    }

    return false;
  }
}
