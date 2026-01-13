import { ServiceBuilding } from './serviceBuilding.js';

/**
 * School - Provides education to citizens within range
 * Improves education needs of nearby citizens
 */
export class School extends ServiceBuilding {
  constructor(x, y) {
    super(
      x,
      y,
      'school',
      6, // Service radius: 6 tiles
      300 // Can educate 300 citizens
    );

    this.maxStaff = 7; // Teachers and staff
  }

  /**
   * Provide education to citizens in range
   * @param {City} city
   */
  provideEducation(city) {
    if (this.effectiveness < 25) return; // Too understaffed to teach

    // Improve education of citizens in range
    for (let dx = -this.serviceRadius; dx <= this.serviceRadius; dx++) {
      for (let dy = -this.serviceRadius; dy <= this.serviceRadius; dy++) {
        const tile = city.getTile(this.x + dx, this.y + dy);
        if (tile?.building?.type === 'residential' && tile.building.residents) {
          const residents = tile.building.residents.getResidents();
          for (const citizen of residents) {
            // Education improvement scaled by effectiveness
            // Faster for young citizens
            const isYoung = citizen.age < 30;
            const baseBoost = isYoung ? 0.8 : 0.3;
            const educationBoost = (this.effectiveness / 100) * baseBoost;
            citizen.needs.improve('education', educationBoost);
          }
        }
      }
    }
  }

  simulate(city) {
    super.simulate(city);
    this.provideEducation(city);
  }

  toHTML() {
    return `
      <div class="info-heading">🏫 School</div>
      ${super.toHTML()}
      <br>
      <div class="info-label" style="margin-top: 10px; font-size: 0.9em; color: #aaffaa;">
        Provides education to citizens within ${this.serviceRadius} tiles
      </div>
    `;
  }
}
