import { ServiceBuilding } from './serviceBuilding.js';

/**
 * Fire Station - Provides fire protection to nearby buildings
 * Also contributes to safety needs
 */
export class FireStation extends ServiceBuilding {
  constructor(x, y) {
    super(
      x,
      y,
      'fire-station',
      12, // Service radius: 12 tiles (fire trucks can travel far)
      600 // Can protect area serving 600 citizens
    );

    this.maxStaff = 6; // Firefighters
  }

  /**
   * Provide fire protection to citizens in range
   * @param {City} city
   */
  provideProtection(city) {
    if (this.effectiveness < 25) return; // Too understaffed

    // Improve safety of citizens in range (fire protection = safety)
    for (let dx = -this.serviceRadius; dx <= this.serviceRadius; dx++) {
      for (let dy = -this.serviceRadius; dy <= this.serviceRadius; dy++) {
        const tile = city.getTile(this.x + dx, this.y + dy);
        if (tile?.building?.type === 'residential' && tile.building.residents) {
          const residents = tile.building.residents.getResidents();
          for (const citizen of residents) {
            // Safety improvement scaled by effectiveness
            const safetyBoost = (this.effectiveness / 100) * 0.3; // 0-0.3 safety per step
            citizen.needs.improve('safety', safetyBoost);
          }
        }
      }
    }
  }

  simulate(city) {
    super.simulate(city);
    this.provideProtection(city);
  }

  toHTML() {
    return `
      <div class="info-heading">🚒 Fire Station</div>
      ${super.toHTML()}
      <br>
      <div class="info-label" style="margin-top: 10px; font-size: 0.9em; color: #aaffaa;">
        Provides fire protection within ${this.serviceRadius} tiles
      </div>
    `;
  }
}
