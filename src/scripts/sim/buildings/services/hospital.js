import { ServiceBuilding } from './serviceBuilding.js';

/**
 * Hospital - Provides healthcare to citizens within range
 * Improves health needs of nearby citizens
 */
export class Hospital extends ServiceBuilding {
  constructor(x, y) {
    super(
      x,
      y,
      'hospital',
      8, // Service radius: 8 tiles
      500 // Can serve 500 citizens
    );

    this.maxStaff = 10; // Hospitals need more staff (doctors, nurses)
  }

  /**
   * Provide healthcare to citizens in range
   * @param {City} city
   */
  provideHealthcare(city) {
    if (this.effectiveness < 25) return; // Too understaffed to help

    // Improve health of citizens in range
    for (let dx = -this.serviceRadius; dx <= this.serviceRadius; dx++) {
      for (let dy = -this.serviceRadius; dy <= this.serviceRadius; dy++) {
        const tile = city.getTile(this.x + dx, this.y + dy);
        if (tile?.building?.type === 'residential' && tile.building.residents) {
          const residents = tile.building.residents.getResidents();
          for (const citizen of residents) {
            // Health improvement scaled by effectiveness
            const healthBoost = (this.effectiveness / 100) * 0.5; // 0-0.5 health per step
            citizen.needs.improve('health', healthBoost);
          }
        }
      }
    }
  }

  /**
   * Repair damaged buildings in range
   * @param {City} city
   */
  repairBuildings(city) {
    if (this.effectiveness < 50) return; // Need at least 50% effectiveness to repair

    // Repair damaged buildings in range
    for (let dx = -this.serviceRadius; dx <= this.serviceRadius; dx++) {
      for (let dy = -this.serviceRadius; dy <= this.serviceRadius; dy++) {
        const tile = city.getTile(this.x + dx, this.y + dy);
        if (tile?.building && tile.building.damageState > 0) {
          // Repair chance scaled by effectiveness (5% base chance at 100% effectiveness)
          const repairChance = (this.effectiveness / 100) * 0.05;

          if (Math.random() < repairChance) {
            tile.building.damageState--;

            // Notify when building is fully repaired
            if (tile.building.damageState === 0 && window.activityFeed) {
              window.activityFeed.event(
                `🏥 Building at (${this.x + dx}, ${this.y + dy}) fully repaired`,
                '✅'
              );
            }
          }
        }
      }
    }
  }

  simulate(city) {
    super.simulate(city);
    this.provideHealthcare(city);
    this.repairBuildings(city);
  }

  toHTML() {
    return `
      <div class="info-heading">🏥 Hospital</div>
      ${super.toHTML()}
      <br>
      <div class="info-label" style="margin-top: 10px; font-size: 0.9em; color: #aaffaa;">
        Provides healthcare to citizens within ${this.serviceRadius} tiles
      </div>
    `;
  }
}
