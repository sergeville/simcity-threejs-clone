/**
 * Represents the needs of a citizen
 */
export class CitizenNeeds {
  /**
   * Health level (0-100)
   * @type {number}
   */
  health = 100;

  /**
   * Safety level (0-100)
   * @type {number}
   */
  safety = 100;

  /**
   * Education level (0-100)
   * @type {number}
   */
  education = 50; // Start at 50 (basic education)

  /**
   * Overall happiness (0-100)
   * @type {number}
   */
  happiness = 75;

  /**
   * Reference to the citizen
   * @type {Citizen}
   */
  #citizen;

  constructor(citizen) {
    this.#citizen = citizen;
  }

  /**
   * Calculate overall happiness based on needs
   * Weighted formula: 40% safety, 30% health, 20% education, 10% environment
   * @returns {number} Happiness value (0-100)
   */
  calculateHappiness() {
    // Weighted average of needs
    const baseHappiness =
      this.safety * 0.4 +
      this.health * 0.3 +
      this.education * 0.2 +
      50 * 0.1; // Environment placeholder (50 = neutral)

    // Apply modifiers (will be enhanced later)
    let modifiedHappiness = baseHappiness;

    // Tax modifier (future implementation)
    // Employment modifier
    if (this.#citizen.state === 'unemployed') {
      modifiedHappiness -= 15;
    }

    // Clamp to 0-100
    this.happiness = Math.max(0, Math.min(100, modifiedHappiness));
    return this.happiness;
  }

  /**
   * Decay needs over time when not met
   */
  decay() {
    // Health decays without healthcare access (future: check for hospital coverage)
    // For now, slow natural decay
    this.health = Math.max(0, this.health - 0.1);

    // Safety decays without police coverage (future: check for police coverage)
    // For now, slow natural decay
    this.safety = Math.max(0, this.safety - 0.1);

    // Education doesn't decay naturally, but can be improved
    // (future: check for school attendance)

    // Recalculate happiness after decay
    this.calculateHappiness();
  }

  /**
   * Get the deficit for each need (how much is missing from 100)
   * @returns {{health: number, safety: number, education: number}}
   */
  getDeficit() {
    return {
      health: 100 - this.health,
      safety: 100 - this.safety,
      education: 100 - this.education
    };
  }

  /**
   * Get the most urgent need
   * @returns {string} The name of the most urgent need
   */
  getMostUrgentNeed() {
    const needs = {
      health: this.health,
      safety: this.safety,
      education: this.education
    };

    let lowest = 'health';
    let lowestValue = 100;

    for (const [need, value] of Object.entries(needs)) {
      if (value < lowestValue) {
        lowestValue = value;
        lowest = need;
      }
    }

    return lowest;
  }

  /**
   * Improve a specific need
   * @param {string} need - 'health', 'safety', or 'education'
   * @param {number} amount - Amount to improve (positive number)
   */
  improve(need, amount) {
    if (need === 'health') {
      this.health = Math.min(100, this.health + amount);
    } else if (need === 'safety') {
      this.safety = Math.min(100, this.safety + amount);
    } else if (need === 'education') {
      this.education = Math.min(100, this.education + amount);
    }

    this.calculateHappiness();
  }

  /**
   * Check if any need is critically low (below 20)
   * @returns {boolean}
   */
  hasCriticalNeed() {
    return this.health < 20 || this.safety < 20 || this.education < 20;
  }

  /**
   * Get a color code for happiness level
   * @returns {string} 'green', 'yellow', or 'red'
   */
  getHappinessColor() {
    if (this.happiness >= 67) return 'green';
    if (this.happiness >= 34) return 'yellow';
    return 'red';
  }

  /**
   * Returns an HTML representation of needs
   * @returns {string}
   */
  toHTML() {
    const healthColor = this.health >= 67 ? 'green' : this.health >= 34 ? 'yellow' : 'red';
    const safetyColor = this.safety >= 67 ? 'green' : this.safety >= 34 ? 'yellow' : 'red';
    const educationColor = this.education >= 67 ? 'green' : this.education >= 34 ? 'yellow' : 'red';
    const happinessColor = this.getHappinessColor();

    return `
      <div class="info-heading">Needs</div>
      <span class="info-label">Health </span>
      <span class="info-value" style="color: ${healthColor}">${Math.floor(this.health)}/100</span>
      <br>
      <span class="info-label">Safety </span>
      <span class="info-value" style="color: ${safetyColor}">${Math.floor(this.safety)}/100</span>
      <br>
      <span class="info-label">Education </span>
      <span class="info-value" style="color: ${educationColor}">${Math.floor(this.education)}/100</span>
      <br>
      <span class="info-label">Happiness </span>
      <span class="info-value" style="color: ${happinessColor}">${Math.floor(this.happiness)}/100</span>
      <br>
    `;
  }

  /**
   * Serialize needs state
   * @returns {Object}
   */
  serialize() {
    return {
      health: this.health,
      safety: this.safety,
      education: this.education,
      happiness: this.happiness
    };
  }

  /**
   * Deserialize needs state
   * @param {Object} data
   */
  deserialize(data) {
    this.health = data.health;
    this.safety = data.safety;
    this.education = data.education;
    this.happiness = data.happiness;
  }
}
