import { ServiceBuilding } from './serviceBuilding.js';

/**
 * Police Station - Provides safety to citizens within range
 * Improves safety needs of nearby citizens
 */
export class PoliceStation extends ServiceBuilding {
  constructor(x, y) {
    super(
      x,
      y,
      'police-station',
      10, // Service radius: 10 tiles
      400 // Can serve 400 citizens
    );

    this.maxStaff = 8; // Police officers
  }

  /**
   * Provide safety to citizens in range
   * @param {City} city
   */
  provideSafety(city) {
    if (this.effectiveness < 25) return; // Too understaffed to patrol

    // Improve safety of citizens in range
    for (let dx = -this.serviceRadius; dx <= this.serviceRadius; dx++) {
      for (let dy = -this.serviceRadius; dy <= this.serviceRadius; dy++) {
        const tile = city.getTile(this.x + dx, this.y + dy);
        if (tile?.building?.type === 'residential' && tile.building.residents) {
          const residents = tile.building.residents.getResidents();
          for (const citizen of residents) {
            // Safety improvement scaled by effectiveness
            const safetyBoost = (this.effectiveness / 100) * 0.5; // 0-0.5 safety per step
            citizen.needs.improve('safety', safetyBoost);
          }
        }
      }
    }
  }

  simulate(city) {
    super.simulate(city);
    this.provideSafety(city);
  }

  toHTML() {
    return `
      <div class="info-heading">👮 Police Station</div>
      ${super.toHTML()}
      <br>
      <div class="info-label" style="margin-top: 10px; font-size: 0.9em; color: #aaffaa;">
        Provides safety to citizens within ${this.serviceRadius} tiles
      </div>
    `;
  }
}
