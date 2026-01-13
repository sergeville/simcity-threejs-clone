import { SimService } from './simService.js';

/**
 * Manages disasters (fires, floods, power outages) and emergency responses
 */
export class DisasterService extends SimService {
  /**
   * Active disasters
   * @type {Array}
   */
  activeDisasters = [];

  /**
   * Disaster spawn counter
   * @type {number}
   */
  #spawnCounter = 0;

  /**
   * Steps between disaster chance checks
   * @type {number}
   */
  #checkInterval = 100; // Check every 100 steps

  /**
   * Probability of disaster per check
   * @type {number}
   */
  disasterChance = 0.05; // 5% chance per check

  /**
   * Is disaster system enabled?
   * @type {boolean}
   */
  enabled = true;

  /**
   * Disaster difficulty level
   * 0 = None (disabled)
   * 1 = Easy (low frequency, low damage)
   * 2 = Normal (default)
   * 3 = Hard (high frequency, high damage)
   * @type {number}
   */
  difficulty = 2;

  constructor() {
    super();
  }

  /**
   * Set disaster difficulty
   * @param {number} level - 0 (None), 1 (Easy), 2 (Normal), 3 (Hard)
   */
  setDifficulty(level) {
    this.difficulty = Math.max(0, Math.min(3, level));

    // Adjust parameters based on difficulty
    switch (this.difficulty) {
      case 0: // None
        this.enabled = false;
        break;
      case 1: // Easy
        this.enabled = true;
        this.disasterChance = 0.02; // 2% chance
        this.#checkInterval = 150; // Less frequent checks
        break;
      case 2: // Normal
        this.enabled = true;
        this.disasterChance = 0.05; // 5% chance
        this.#checkInterval = 100;
        break;
      case 3: // Hard
        this.enabled = true;
        this.disasterChance = 0.10; // 10% chance
        this.#checkInterval = 75; // More frequent checks
        break;
    }
  }

  /**
   * Get difficulty name
   * @returns {string}
   */
  getDifficultyName() {
    const names = ['None', 'Easy', 'Normal', 'Hard'];
    return names[this.difficulty] || 'Normal';
  }

  /**
   * Simulate disasters
   * @param {City} city
   */
  simulate(city) {
    if (!this.enabled) return;

    this.#spawnCounter++;

    // Check for new disasters periodically
    if (this.#spawnCounter >= this.#checkInterval) {
      this.#spawnCounter = 0;
      this.#checkForDisasters(city);
    }

    // Update existing disasters
    for (let i = this.activeDisasters.length - 1; i >= 0; i--) {
      const disaster = this.activeDisasters[i];
      disaster.update(city);

      // Remove expired disasters
      if (disaster.isExpired()) {
        disaster.cleanup(city);
        this.activeDisasters.splice(i, 1);
      }
    }
  }

  /**
   * Check if a new disaster should spawn
   * @param {City} city
   */
  #checkForDisasters(city) {
    if (Math.random() < this.disasterChance) {
      this.#spawnRandomDisaster(city);
    }
  }

  /**
   * Spawn a random disaster
   * @param {City} city
   */
  #spawnRandomDisaster(city) {
    const disasterTypes = ['fire', 'flood', 'power-outage'];
    const type = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];

    switch (type) {
      case 'fire':
        this.#spawnFire(city);
        break;
      case 'flood':
        this.#spawnFlood(city);
        break;
      case 'power-outage':
        this.#spawnPowerOutage(city);
        break;
    }
  }

  /**
   * Spawn a fire disaster
   * @param {City} city
   */
  #spawnFire(city) {
    // Find a random building that can catch fire
    const candidates = [];
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile?.building && tile.building.type !== 'road' && tile.building.type !== 'power-line') {
          candidates.push({ x, y, building: tile.building });
        }
      }
    }

    if (candidates.length === 0) return;

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const fire = new Fire(target.x, target.y, city);
    this.activeDisasters.push(fire);

    if (window.activityFeed) {
      window.activityFeed.event(`🔥 FIRE at (${target.x}, ${target.y})! Fire department responding...`, '🔥');
    }
  }

  /**
   * Spawn a flood disaster
   * @param {City} city
   */
  #spawnFlood(city) {
    // Find a water tile or create flood center
    let x = Math.floor(Math.random() * city.size);
    let y = Math.floor(Math.random() * city.size);

    const flood = new Flood(x, y, 5); // Radius of 5 tiles
    this.activeDisasters.push(flood);

    if (window.activityFeed) {
      window.activityFeed.event(`💧 FLOOD near (${x}, ${y})! Area affected.`, '💧');
    }
  }

  /**
   * Spawn a power outage
   * @param {City} city
   */
  #spawnPowerOutage(city) {
    // Find a power plant
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile?.building?.type === 'power-plant') {
          const outage = new PowerOutage(x, y, 50); // 50 step duration
          this.activeDisasters.push(outage);

          if (window.activityFeed) {
            window.activityFeed.event(`⚡ POWER OUTAGE at power plant (${x}, ${y})!`, '⚡');
          }
          return;
        }
      }
    }
  }

  /**
   * Serialize disaster service state
   * @returns {Object}
   */
  serialize() {
    return {
      difficulty: this.difficulty,
      enabled: this.enabled,
      disasterChance: this.disasterChance,
      activeDisasters: this.activeDisasters.map(d => d.serialize())
    };
  }

  /**
   * Deserialize disaster service state
   * @param {Object} data
   * @param {City} city
   */
  deserialize(data, city) {
    this.setDifficulty(data.difficulty);
    this.enabled = data.enabled;
    this.disasterChance = data.disasterChance;

    // Restore active disasters
    this.activeDisasters = [];
    for (const disasterData of data.activeDisasters || []) {
      let disaster;
      switch (disasterData.type) {
        case 'fire':
          disaster = Fire.deserialize(disasterData, city);
          break;
        case 'flood':
          disaster = Flood.deserialize(disasterData);
          break;
        case 'power-outage':
          disaster = PowerOutage.deserialize(disasterData);
          break;
      }
      if (disaster) {
        this.activeDisasters.push(disaster);
      }
    }
  }
}

/**
 * Fire disaster - spreads to nearby buildings
 */
class Fire {
  constructor(x, y, city) {
    this.x = x;
    this.y = y;
    this.duration = 30; // Burns for 30 steps
    this.spreadChance = 0.3; // 30% chance to spread per step
    this.hasSpread = false;

    // Mark building as on fire
    const tile = city.getTile(x, y);
    if (tile?.building) {
      tile.building.onFire = true;
    }
  }

  update(city) {
    this.duration--;

    // Try to spread to adjacent buildings
    if (!this.hasSpread && Math.random() < this.spreadChance) {
      this.#spread(city);
      this.hasSpread = true;
    }

    // Damage citizens in burning building
    const tile = city.getTile(this.x, this.y);
    if (tile?.building?.type === 'residential' && tile.building.residents) {
      const residents = tile.building.residents.getResidents();
      for (const resident of residents) {
        resident.needs.health = Math.max(0, resident.needs.health - 5);
        resident.needs.safety = Math.max(0, resident.needs.safety - 10);
      }
    }

    // Check if fire station is nearby (auto-response)
    this.#checkFireStationResponse(city);
  }

  #spread(city) {
    // Try to spread to adjacent tiles
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dx, dy] of directions) {
      if (Math.random() < 0.5) { // 50% chance to spread in each direction
        const tile = city.getTile(this.x + dx, this.y + dy);
        if (tile?.building && !tile.building.onFire && tile.building.type !== 'road') {
          tile.building.onFire = true;

          if (window.activityFeed) {
            window.activityFeed.event(`🔥 Fire spreading to (${this.x + dx}, ${this.y + dy})!`, '🔥');
          }
        }
      }
    }
  }

  #checkFireStationResponse(city) {
    // Check if there's a fire station within range
    for (let dx = -12; dx <= 12; dx++) {
      for (let dy = -12; dy <= 12; dy++) {
        const tile = city.getTile(this.x + dx, this.y + dy);
        if (tile?.building?.type === 'fire-station' && tile.building.effectiveness > 50) {
          // Fire station responds - reduce fire duration
          this.duration = Math.max(0, this.duration - 5);
          return;
        }
      }
    }
  }

  isExpired() {
    return this.duration <= 0;
  }

  cleanup(city) {
    const tile = city.getTile(this.x, this.y);
    if (tile?.building) {
      delete tile.building.onFire;

      // Determine damage based on fire duration
      const damageRoll = Math.random();

      if (damageRoll < 0.15) {
        // 15% chance - complete destruction
        city.bulldoze(this.x, this.y);
        if (window.activityFeed) {
          window.activityFeed.event(`💥 Building at (${this.x}, ${this.y}) destroyed by fire!`, '💥');
        }
      } else if (damageRoll < 0.35) {
        // 20% chance - heavy damage
        tile.building.damageState = 3;
        if (window.activityFeed) {
          window.activityFeed.event(`Building at (${this.x}, ${this.y}) heavily damaged by fire`, '🔥');
        }
      } else if (damageRoll < 0.60) {
        // 25% chance - moderate damage
        tile.building.damageState = 2;
      } else if (damageRoll < 0.85) {
        // 25% chance - light damage
        tile.building.damageState = 1;
      }
      // 15% chance - no damage
    }
  }

  serialize() {
    return {
      type: 'fire',
      x: this.x,
      y: this.y,
      duration: this.duration,
      spreadChance: this.spreadChance,
      hasSpread: this.hasSpread
    };
  }

  static deserialize(data, city) {
    const fire = new Fire(data.x, data.y, city);
    fire.duration = data.duration;
    fire.spreadChance = data.spreadChance;
    fire.hasSpread = data.hasSpread;
    return fire;
  }
}

/**
 * Flood disaster - damages buildings in area
 */
class Flood {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.duration = 20; // Lasts 20 steps
  }

  update(city) {
    this.duration--;

    // Damage buildings and citizens in flood area
    for (let dx = -this.radius; dx <= this.radius; dx++) {
      for (let dy = -this.radius; dy <= this.radius; dy++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.radius) {
          const tile = city.getTile(this.x + dx, this.y + dy);

          if (tile?.building?.type === 'residential' && tile.building.residents) {
            const residents = tile.building.residents.getResidents();
            for (const resident of residents) {
              resident.needs.health = Math.max(0, resident.needs.health - 2);
              resident.needs.safety = Math.max(0, resident.needs.safety - 3);
            }
          }
        }
      }
    }
  }

  isExpired() {
    return this.duration <= 0;
  }

  cleanup(city) {
    // Flood cleanup - damage buildings in affected area
    for (let dx = -this.radius; dx <= this.radius; dx++) {
      for (let dy = -this.radius; dy <= this.radius; dy++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.radius) {
          const tile = city.getTile(this.x + dx, this.y + dy);
          if (tile?.building) {
            const damageRoll = Math.random();

            if (damageRoll < 0.05) {
              // 5% chance - complete destruction
              city.bulldoze(this.x + dx, this.y + dy);
            } else if (damageRoll < 0.15) {
              // 10% chance - heavy damage
              tile.building.damageState = Math.max(tile.building.damageState, 3);
            } else if (damageRoll < 0.30) {
              // 15% chance - moderate damage
              tile.building.damageState = Math.max(tile.building.damageState, 2);
            } else if (damageRoll < 0.50) {
              // 20% chance - light damage
              tile.building.damageState = Math.max(tile.building.damageState, 1);
            }
          }
        }
      }
    }
  }

  serialize() {
    return {
      type: 'flood',
      x: this.x,
      y: this.y,
      radius: this.radius,
      duration: this.duration
    };
  }

  static deserialize(data) {
    const flood = new Flood(data.x, data.y, data.radius);
    flood.duration = data.duration;
    return flood;
  }
}

/**
 * Power outage - disables power temporarily
 */
class PowerOutage {
  constructor(x, y, duration) {
    this.x = x;
    this.y = y;
    this.duration = duration;
  }

  update(city) {
    this.duration--;

    // Disable power plant
    const tile = city.getTile(this.x, this.y);
    if (tile?.building?.type === 'power-plant') {
      tile.building.disabled = true;
    }
  }

  isExpired() {
    return this.duration <= 0;
  }

  cleanup(city) {
    // Re-enable power plant
    const tile = city.getTile(this.x, this.y);
    if (tile?.building?.type === 'power-plant') {
      delete tile.building.disabled;

      if (window.activityFeed) {
        window.activityFeed.event(`⚡ Power restored at (${this.x}, ${this.y})`, '✅');
      }
    }
  }

  serialize() {
    return {
      type: 'power-outage',
      x: this.x,
      y: this.y,
      duration: this.duration
    };
  }

  static deserialize(data) {
    const outage = new PowerOutage(data.x, data.y, data.duration);
    return outage;
  }
}
