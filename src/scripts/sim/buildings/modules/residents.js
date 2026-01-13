import config from '../../../config.js';
import { Citizen } from '../../citizen.js';
import { City } from '../../city.js';
import { Zone as ResidentialZone } from '../../buildings/zones/zone.js';
import { DevelopmentState } from './development.js';
import { SimModule } from './simModule.js';

/**
 * Logic for residents moving into and out of a building
 */
export class ResidentsModule extends SimModule {
  /**
   * @type {ResidentialZone}
   */
  #zone;

  /**
   * @type {Citizen[]}
   */
  #residents = [];

  /**
   * @param {ResidentialZone} zone 
   */
  constructor(zone) {
    super();
    this.#zone = zone;
  }

  /**
   * Returns the number of residents
   * @type {number}
   */
  get count() {
    return this.#residents.length;
  }

  /**
   * Returns all residents (for CitizenManager)
   * @returns {Citizen[]}
   */
  getResidents() {
    return this.#residents;
  }

  /**
   * Add a single resident to the building
   * @param {Citizen} citizen
   */
  addResident(citizen) {
    this.#residents.push(citizen);
  }

  /**
   * Set the residents array (for deserialization)
   * @param {Citizen[]} residents
   */
  setResidents(residents) {
    this.#residents = residents;
  }

  /**
   * Maximuim number of residents that can live in this building
   * @returns {number}
   */
  get maximum() {
    return Math.pow(config.modules.residents.maxResidents, this.#zone.development.level);
  }

  /**
   * @param {City} city 
   */
  simulate(city) {
    // If building is abandoned, all residents are evicted and no more residents are allowed to move in.
    if (this.#zone.development.state === DevelopmentState.abandoned && this.#residents.length > 0) {
      this.evictAll();
    } else if (this.#zone.development.state === DevelopmentState.developed) {
      // Move in new residents if there is room
      if (this.#residents.length < this.maximum && Math.random() < config.modules.residents.residentMoveInChance) {
        const newCitizen = new Citizen(this.#zone);
        this.#residents.push(newCitizen);

        // Activity feed notification
        if (window.activityFeed && Math.random() < 0.2) { // Only show 20% to avoid spam
          window.activityFeed.citizen(`${newCitizen.name} moved into the city`, '🏠');
        }
      }
    }

    for (const resident of this.#residents) {
      resident.simulate(city);
    }
  }

  /**
   * Evicts all residents from the building
   */
  evictAll() {
    for (const resident of this.#residents) {
      resident.dispose();
    }
    this.#residents = [];
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.evictAll();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = `<div class="info-heading">Residents (${this.#residents.length}/${this.maximum})</div>`;

    html += '<ul class="info-citizen-list">';
    for (const resident of this.#residents) {
      html += resident.toHTML();
    }
    html += '</ul>';

    return html;
  }
}