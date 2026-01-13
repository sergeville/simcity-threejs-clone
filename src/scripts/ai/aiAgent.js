import { BuildingType } from '../sim/buildings/buildingType.js';
import { TerrainGenerator } from '../sim/terrainGenerator.js';

/**
 * AI Agent that plays the game autonomously
 * Acts as an AI mayor making strategic decisions
 */
export class AIAgent {
  /**
   * Is the AI currently controlling the game?
   * @type {boolean}
   */
  enabled = false;

  /**
   * Decision cooldown counter (steps between decisions)
   * @type {number}
   */
  #decisionCooldown = 0;

  /**
   * Steps to wait between major decisions
   * @type {number}
   */
  #decisionInterval = 3;

  /**
   * Current strategy state
   * @type {string}
   */
  #strategy = 'expand'; // 'expand', 'optimize', 'maintain'

  /**
   * Make decisions about the city
   * @param {City} city
   */
  simulate(city) {
    if (!this.enabled) return;

    this.#decisionCooldown--;
    if (this.#decisionCooldown > 0) return;

    // Reset cooldown
    this.#decisionCooldown = this.#decisionInterval;

    // Analyze city state
    const analysis = this.#analyzeCity(city);

    // Make strategic decisions based on analysis
    this.#makeDecision(city, analysis);
  }

  /**
   * Analyze the current state of the city
   * @param {City} city
   * @returns {object} Analysis data
   */
  #analyzeCity(city) {
    const economy = city.economy;
    const funds = economy?.funds || 0;

    let residentialCount = 0;
    let commercialCount = 0;
    let industrialCount = 0;
    let roadCount = 0;
    let powerPlantCount = 0;
    let totalBuildings = 0;
    let emptyTiles = 0;
    let population = city.population;
    let totalJobs = 0;
    let filledJobs = 0;

    // Count buildings and analyze employment
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (!tile.building) {
          emptyTiles++;
          continue;
        }

        totalBuildings++;

        switch (tile.building.type) {
          case 'residential':
            residentialCount++;
            break;
          case 'commercial':
            commercialCount++;
            if (tile.building.jobs) {
              totalJobs += tile.building.jobs.maxWorkers;
              filledJobs += tile.building.jobs.workers.length;
            }
            break;
          case 'industrial':
            industrialCount++;
            if (tile.building.jobs) {
              totalJobs += tile.building.jobs.maxWorkers;
              filledJobs += tile.building.jobs.workers.length;
            }
            break;
          case 'road':
            roadCount++;
            break;
          case 'power-plant':
            powerPlantCount++;
            break;
        }
      }
    }

    const unemploymentRate = population > 0 ? (population - filledJobs) / population : 0;
    const jobFillRate = totalJobs > 0 ? filledJobs / totalJobs : 0;

    return {
      funds,
      residentialCount,
      commercialCount,
      industrialCount,
      roadCount,
      powerPlantCount,
      totalBuildings,
      emptyTiles,
      population,
      totalJobs,
      filledJobs,
      unemploymentRate,
      jobFillRate,
      netRevenue: economy?.netRevenue || 0
    };
  }

  /**
   * Make strategic decisions based on city analysis
   * @param {City} city
   * @param {object} analysis
   */
  #makeDecision(city, analysis) {
    console.log(`[AI Mayor] Funds: $${analysis.funds.toFixed(0)}, Pop: ${analysis.population}, Jobs: ${analysis.filledJobs}/${analysis.totalJobs}, Unemployment: ${(analysis.unemploymentRate * 100).toFixed(1)}%`);

    // Emergency: Build power if we have none
    if (analysis.powerPlantCount === 0 && analysis.funds >= 5000) {
      this.#buildPowerInfrastructure(city);
      return;
    }

    // Priority: Build roads if we're lacking connectivity
    if (analysis.roadCount < analysis.totalBuildings * 0.3 && analysis.funds >= 100) {
      this.#buildRoad(city);
      return;
    }

    // Strategy: Balanced growth
    const targetJobsPerResident = 0.6; // Aim for 60% employment rate
    const currentJobsPerResident = analysis.population > 0 ? analysis.totalJobs / analysis.population : 0;

    // High unemployment → Build more jobs
    if (analysis.unemploymentRate > 0.3 && analysis.funds >= 1000) {
      if (Math.random() < 0.5) {
        this.#buildCommercial(city);
      } else {
        this.#buildIndustrial(city);
      }
      return;
    }

    // Low population → Build housing
    if (analysis.population < 10 || currentJobsPerResident > targetJobsPerResident) {
      if (analysis.funds >= 500) {
        this.#buildResidential(city);
        return;
      }
    }

    // Balanced growth → Build what's needed most
    if (analysis.funds >= 1000) {
      const residentialRatio = analysis.residentialCount / (analysis.totalBuildings + 1);
      const commercialRatio = analysis.commercialCount / (analysis.totalBuildings + 1);
      const industrialRatio = analysis.industrialCount / (analysis.totalBuildings + 1);

      // Aim for 50% residential, 25% commercial, 25% industrial
      if (residentialRatio < 0.4) {
        this.#buildResidential(city);
      } else if (commercialRatio < 0.2) {
        this.#buildCommercial(city);
      } else if (industrialRatio < 0.2) {
        this.#buildIndustrial(city);
      } else {
        // Expand with residential
        this.#buildResidential(city);
      }
    }
  }

  /**
   * Build power infrastructure
   * @param {City} city
   */
  #buildPowerInfrastructure(city) {
    // Find a central location
    const centerX = Math.floor(city.size / 2);
    const centerY = Math.floor(city.size / 2);

    // Try to build power plant near center
    for (let radius = 0; radius < city.size / 2; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const x = centerX + dx;
          const y = centerY + dy;

          if (this.#tryBuild(city, x, y, BuildingType.powerPlant)) {
            console.log(`[AI Mayor] Built power plant at (${x}, ${y})`);
            if (window.activityFeed) {
              window.activityFeed.ai('AI Mayor: Built power plant to provide electricity');
            }
            return;
          }
        }
      }
    }
  }

  /**
   * Build a residential zone
   * @param {City} city
   */
  #buildResidential(city) {
    const location = this.#findBuildLocation(city, 'residential');
    if (location && this.#tryBuild(city, location.x, location.y, BuildingType.residential)) {
      console.log(`[AI Mayor] Built residential at (${location.x}, ${location.y})`);
      if (window.activityFeed) {
        window.activityFeed.ai('AI Mayor: Expanding housing to accommodate more citizens');
      }
    }
  }

  /**
   * Build a commercial zone
   * @param {City} city
   */
  #buildCommercial(city) {
    const location = this.#findBuildLocation(city, 'commercial');
    if (location && this.#tryBuild(city, location.x, location.y, BuildingType.commercial)) {
      console.log(`[AI Mayor] Built commercial at (${location.x}, ${location.y})`);
      if (window.activityFeed) {
        window.activityFeed.ai('AI Mayor: Building commercial zone to create jobs');
      }
    }
  }

  /**
   * Build an industrial zone
   * @param {City} city
   */
  #buildIndustrial(city) {
    const location = this.#findBuildLocation(city, 'industrial');
    if (location && this.#tryBuild(city, location.x, location.y, BuildingType.industrial)) {
      console.log(`[AI Mayor] Built industrial at (${location.x}, ${location.y})`);
      if (window.activityFeed) {
        window.activityFeed.ai('AI Mayor: Developing industrial zone for employment');
      }
    }
  }

  /**
   * Build a road
   * @param {City} city
   */
  #buildRoad(city) {
    // Find a location that connects buildings
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile?.building) continue; // Skip occupied tiles

        // Check if this location would connect existing buildings
        const hasAdjacentBuilding =
          city.getTile(x - 1, y)?.building ||
          city.getTile(x + 1, y)?.building ||
          city.getTile(x, y - 1)?.building ||
          city.getTile(x, y + 1)?.building;

        if (hasAdjacentBuilding && this.#tryBuild(city, x, y, BuildingType.road)) {
          console.log(`[AI Mayor] Built road at (${x}, ${y})`);
          return;
        }
      }
    }
  }

  /**
   * Find a good location to build a specific type of building
   * @param {City} city
   * @param {string} buildingType
   * @returns {{x: number, y: number} | null}
   */
  #findBuildLocation(city, buildingType) {
    const candidates = [];

    // Find all empty tiles
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile?.building) continue; // Skip occupied tiles
        if (!TerrainGenerator.isBuildable(tile.terrain)) continue; // Skip unbuildable terrain

        // Check if there's a road nearby (within 2 tiles)
        let hasNearbyRoad = false;
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            const neighbor = city.getTile(x + dx, y + dy);
            if (neighbor?.building?.type === 'road') {
              hasNearbyRoad = true;
              break;
            }
          }
          if (hasNearbyRoad) break;
        }

        // Prefer locations near roads, but allow anywhere if no roads exist
        const score = hasNearbyRoad ? 10 : 1;
        candidates.push({ x, y, score });
      }
    }

    if (candidates.length === 0) return null;

    // Pick a high-scoring candidate
    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.filter(c => c.score === candidates[0].score);
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
  }

  /**
   * Try to build at a location
   * @param {City} city
   * @param {number} x
   * @param {number} y
   * @param {string} buildingType
   * @returns {boolean} True if built successfully
   */
  #tryBuild(city, x, y, buildingType) {
    return city.placeBuilding(x, y, buildingType);
  }

  /**
   * Toggle AI control
   */
  toggle() {
    this.enabled = !this.enabled;
    console.log(`[AI Mayor] ${this.enabled ? 'ENABLED' : 'DISABLED'}`);

    if (this.enabled) {
      this.#decisionCooldown = 0; // Make first decision immediately
    }
  }
}
