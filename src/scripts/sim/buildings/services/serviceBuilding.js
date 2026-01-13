import { Building } from '../building.js';

/**
 * Base class for service buildings (hospital, police, fire, school)
 * Service buildings provide area-of-effect benefits to nearby citizens
 */
export class ServiceBuilding extends Building {
  /**
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} type - Building type
   * @param {number} serviceRadius - How far the service reaches
   * @param {number} capacity - Maximum citizens that can be served
   */
  constructor(x, y, type, serviceRadius, capacity) {
    super(x, y, type);

    /**
     * Service coverage radius in tiles
     * @type {number}
     */
    this.serviceRadius = serviceRadius;

    /**
     * Maximum number of citizens this building can serve
     * @type {number}
     */
    this.capacity = capacity;

    /**
     * Number of citizens currently being served
     * @type {number}
     */
    this.currentLoad = 0;

    /**
     * Staff working at this building
     * @type {number}
     */
    this.staff = 0;

    /**
     * Maximum staff needed for full operation
     * @type {number}
     */
    this.maxStaff = 5;

    /**
     * Service effectiveness (0-100%)
     * Reduced when understaffed
     * @type {number}
     */
    this.effectiveness = 100;
  }

  /**
   * Update service stats
   * @param {City} city
   */
  simulate(city) {
    super.simulate(city);

    // Calculate effectiveness based on staffing
    const staffRatio = this.maxStaff > 0 ? this.staff / this.maxStaff : 0;
    this.effectiveness = Math.floor(staffRatio * 100);

    // Count citizens in service area
    this.currentLoad = this.#countCitizensInRange(city);
  }

  /**
   * Count citizens within service radius
   * @param {City} city
   * @returns {number}
   */
  #countCitizensInRange(city) {
    let count = 0;

    for (let dx = -this.serviceRadius; dx <= this.serviceRadius; dx++) {
      for (let dy = -this.serviceRadius; dy <= this.serviceRadius; dy++) {
        const tile = city.getTile(this.x + dx, this.y + dy);
        if (tile?.building?.type === 'residential' && tile.building.residents) {
          count += tile.building.residents.count;
        }
      }
    }

    return count;
  }

  /**
   * Check if this service is overloaded
   * @returns {boolean}
   */
  isOverloaded() {
    return this.currentLoad > this.capacity;
  }

  /**
   * Get service utilization percentage
   * @returns {number}
   */
  getUtilization() {
    return this.capacity > 0 ? Math.floor((this.currentLoad / this.capacity) * 100) : 0;
  }

  /**
   * Get color for utilization indicator
   * @returns {string}
   */
  getUtilizationColor() {
    const util = this.getUtilization();
    if (util < 60) return 'green';
    if (util < 90) return 'yellow';
    return 'red';
  }

  toHTML() {
    return `
      <div class="info-heading">${this.type}</div>
      <span class="info-label">Service Radius: </span>
      <span class="info-value">${this.serviceRadius} tiles</span>
      <br>
      <span class="info-label">Capacity: </span>
      <span class="info-value" style="color: ${this.getUtilizationColor()}">
        ${this.currentLoad}/${this.capacity} (${this.getUtilization()}%)
      </span>
      <br>
      <span class="info-label">Effectiveness: </span>
      <span class="info-value" style="color: ${this.effectiveness >= 75 ? 'green' : this.effectiveness >= 50 ? 'yellow' : 'red'}">
        ${this.effectiveness}%
      </span>
      <br>
      <span class="info-label">Staff: </span>
      <span class="info-value">${this.staff}/${this.maxStaff}</span>
      ${this.isOverloaded() ? '<br><span style="color: #ff4444;">⚠️ OVERLOADED - Build more!</span>' : ''}
    `;
  }
}
