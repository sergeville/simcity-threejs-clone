import * as THREE from 'three';
import { BuildingType } from './buildings/buildingType.js';
import { createBuilding } from './buildings/buildingFactory.js';
import { Tile } from './tile.js';
import { VehicleGraph } from './vehicles/vehicleGraph.js';
import { PowerService } from './services/power.js';
import { EconomyService } from './services/economy.js';
import { CitizenManager } from './services/citizenManager.js';
import { DisasterService } from './services/disasterService.js';
import { VisualEffectsService } from './services/visualEffectsService.js';
import { SimService } from './services/simService.js';
import { TerrainGenerator } from './terrainGenerator.js';
import { TimeManager } from './timeManager.js';
import { Citizen } from './citizen.js';
import { Professions } from './profession.js';

export class City extends THREE.Group {
  /**
   * Separate group for organizing debug meshes so they aren't included
   * in raycasting checks
   * @type {THREE.Group}
   */
  debugMeshes = new THREE.Group();
  /**
   * Root node for all scene objects 
   * @type {THREE.Group}
   */
  root = new THREE.Group();
  /**
   * List of services for the city
   * @type {SimService}
   */
  services = [];
  /**
   * The size of the city in tiles
   * @type {number}
   */
  size = 16;
  /**
   * The current simulation time (legacy - days)
   */
  simTime = 0;
  /**
   * Time manager for always-running simulation
   * @type {TimeManager}
   */
  timeManager = new TimeManager();
  /**
   * 2D array of tiles that make up the city
   * @type {Tile[][]}
   */
  tiles = [];
  /**
   * 
   * @param {VehicleGraph} size 
   */
  vehicleGraph;

  constructor(size, name = 'My City') {
    super();

    this.name = name;
    this.size = size;

    this.add(this.debugMeshes);
    this.add(this.root);

    // Generate natural terrain
    const terrainMap = TerrainGenerator.generate(size);

    this.tiles = [];
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        const tile = new Tile(x, y);
        tile.terrain = terrainMap[x][y]; // Set generated terrain
        tile.refreshView(this);
        this.root.add(tile);
        column.push(tile);
      }
      this.tiles.push(column);
    }

    this.services = [];
    this.services.push(new EconomyService());
    this.services.push(new PowerService());
    this.services.push(new DisasterService());

    // Create citizen manager for visual representation
    const citizenManager = new CitizenManager();
    this.services.push(citizenManager);
    this.root.add(citizenManager.citizenGroup);

    // Create visual effects service
    const visualEffects = new VisualEffectsService();
    this.services.push(visualEffects);
    this.root.add(visualEffects.effectsGroup);

    this.vehicleGraph = new VehicleGraph(this.size);
    this.debugMeshes.add(this.vehicleGraph);
  }

  /**
   * The total population of the city
   * @type {number}
   */
  get population() {
    let population = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        population += tile.building?.residents?.count ?? 0;
      }
    }
    return population;
  }

  /**
   * Get the economy service
   * @returns {EconomyService}
   */
  get economy() {
    return this.services.find(s => s instanceof EconomyService);
  }

  /** Returns the title at the coordinates. If the coordinates
   * are out of bounds, then `null` is returned.
   * @param {number} x The x-coordinate of the tile
   * @param {number} y The y-coordinate of the tile
   * @returns {Tile | null}
   */
  getTile(x, y) {
    if (x === undefined || y === undefined ||
      x < 0 || y < 0 ||
      x >= this.size || y >= this.size) {
      return null;
    } else {
      return this.tiles[x][y];
    }
  }

  /**
   * Step the simulation forward by one step
   * @type {number} steps Number of steps to simulate forward in time
   */
  simulate(steps = 1) {
    let count = 0;
    while (count++ < steps) {
      // Update time manager (always-running simulation)
      this.timeManager.tick();

      // Update services
      this.services.forEach((service) => service.simulate(this));

      // Update each building
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          this.getTile(x, y).simulate(this);
        }
      }
    }
    this.simTime++;
  }

  /**
   * Places a building at the specified coordinates if the
   * tile does not already have a building on it
   * @param {number} x
   * @param {number} y
   * @param {string} buildingType
   * @returns {boolean} True if building was placed successfully
   */
  placeBuilding(x, y, buildingType) {
    const tile = this.getTile(x, y);

    // If the tile doesn't already have a building, check if we can afford it
    if (tile && !tile.building) {
      // Check if terrain is buildable
      if (!TerrainGenerator.isBuildable(tile.terrain)) {
        console.warn(`Cannot build on ${tile.terrain} terrain at (${x}, ${y})`);
        return false;
      }

      // Check if player can afford the building
      const economy = this.economy;
      if (economy && !economy.canAfford(buildingType)) {
        // Show insufficient funds message
        if (window.ui) {
          this.#showInsufficientFundsMessage(buildingType, economy.getBuildingCost(buildingType));
        }
        return false;
      }

      // Deduct construction cost
      if (economy) {
        economy.deductConstructionCost(buildingType);
      }

      // Place the building
      tile.setBuilding(createBuilding(x, y, buildingType));
      tile.refreshView(this);

      // Activity feed notification
      if (window.activityFeed) {
        const buildingNames = {
          'residential': 'Residential Zone',
          'commercial': 'Commercial Zone',
          'industrial': 'Industrial Zone',
          'road': 'Road',
          'power-plant': 'Power Plant',
          'power-line': 'Power Line',
          'hospital': 'Hospital 🏥',
          'police-station': 'Police Station 👮',
          'fire-station': 'Fire Station 🚒',
          'school': 'School 🏫'
        };
        const name = buildingNames[buildingType] || buildingType;
        window.activityFeed.construction(`Built ${name} at (${x}, ${y})`);
      }

      // Update buildings on adjacent tile in case they need to
      // change their mesh (e.g. roads)
      this.getTile(x - 1, y)?.refreshView(this);
      this.getTile(x + 1, y)?.refreshView(this);
      this.getTile(x, y - 1)?.refreshView(this);
      this.getTile(x, y + 1)?.refreshView(this);

      if (tile.building.type === BuildingType.road) {
        this.vehicleGraph.updateTile(x, y, tile.building);
      }

      return true;
    }

    return false;
  }

  /**
   * Show insufficient funds message to player
   * @param {string} buildingType
   * @param {number} cost
   */
  #showInsufficientFundsMessage(buildingType, cost) {
    console.warn(`Insufficient funds! ${buildingType} costs $${cost}, you have $${Math.floor(this.economy.funds)}`);
    // Future: Show UI notification
  }

  /**
   * Bulldozes the building at the specified coordinates
   * @param {number} x
   * @param {number} y
   */
  bulldoze(x, y) {
    const tile = this.getTile(x, y);

    if (tile.building) {
      if (tile.building.type === BuildingType.road) {
        this.vehicleGraph.updateTile(x, y, null);
      }

      // Clean up any visual effects for this tile
      const visualEffects = this.services.find(s => s instanceof VisualEffectsService);
      if (visualEffects) {
        visualEffects.removeEffectsForTile(x, y);
      }

      // Activity feed notification
      if (window.activityFeed) {
        window.activityFeed.construction(`Demolished building at (${x}, ${y})`, '🏗️');
      }

      tile.building.dispose();
      tile.setBuilding(null);
      tile.refreshView(this);

      // Update neighboring tiles in case they need to change their mesh (e.g. roads)
      this.getTile(x - 1, y)?.refreshView(this);
      this.getTile(x + 1, y)?.refreshView(this);
      this.getTile(x, y - 1)?.refreshView(this);
      this.getTile(x, y + 1)?.refreshView(this);
    }
  }

  draw() {
    this.vehicleGraph.updateVehicles();
  }

  /**
   * Finds the first tile where the criteria are true
   * @param {{x: number, y: number}} start The starting coordinates of the search
   * @param {(Tile) => (boolean)} filter This function is called on each
   * tile in the search field until `filter` returns true, or there are
   * no more tiles left to search.
   * @param {number} maxDistance The maximum distance to search from the starting tile
   * @returns {Tile | null} The first tile matching `criteria`, otherwiser `null`
   */
  findTile(start, filter, maxDistance) {
    const startTile = this.getTile(start.x, start.y);
    const visited = new Set();
    const tilesToSearch = [];

    // Initialze our search with the starting tile
    tilesToSearch.push(startTile);

    while (tilesToSearch.length > 0) {
      const tile = tilesToSearch.shift();

      // Has this tile been visited? If so, ignore it and move on
      if (visited.has(tile.id)) {
        continue;
      } else {
        visited.add(tile.id);
      }

      // Check if tile is outside the search bounds
      const distance = startTile.distanceTo(tile);
      if (distance > maxDistance) continue;

      // Add this tiles neighbor's to the search list
      tilesToSearch.push(...this.getTileNeighbors(tile.x, tile.y));

      // If this tile passes the criteria 
      if (filter(tile)) {
        return tile;
      }
    }

    return null;
  }

  /**
   * Finds and returns the neighbors of this tile
   * @param {number} x The x-coordinate of the tile
   * @param {number} y The y-coordinate of the tile
   */
  getTileNeighbors(x, y) {
    const neighbors = [];

    if (x > 0) {
      neighbors.push(this.getTile(x - 1, y));
    }
    if (x < this.size - 1) {
      neighbors.push(this.getTile(x + 1, y));
    }
    if (y > 0) {
      neighbors.push(this.getTile(x, y - 1));
    }
    if (y < this.size - 1) {
      neighbors.push(this.getTile(x, y + 1));
    }

    return neighbors;
  }

  /**
   * Serialize the entire city state
   * @returns {Object} Complete save data
   */
  serialize() {
    // Collect all citizens from all residential buildings
    const citizenMap = {};
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile?.building?.type === 'residential' && tile.building.residents) {
          const residents = tile.building.residents.getResidents();
          for (const citizen of residents) {
            citizenMap[citizen.id] = citizen.serialize();
          }
        }
      }
    }

    // Serialize tiles with buildings only (sparse storage)
    const tilesData = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile?.building) {
          tilesData.push({
            x: tile.x,
            y: tile.y,
            terrain: tile.terrain,
            building: tile.building.serialize()
          });
        }
      }
    }

    // Find economy and disaster services
    const economyService = this.services.find(s => s.constructor.name === 'EconomyService');
    const disasterService = this.services.find(s => s.constructor.name === 'DisasterService');

    return {
      version: '1.0.0',
      timestamp: Date.now(),
      metadata: {
        cityName: this.name,
        citySize: this.size,
        simTime: this.simTime
      },
      timeManager: this.timeManager.serialize(),
      economy: economyService ? economyService.serialize() : null,
      disasters: disasterService ? disasterService.serialize() : null,
      tiles: tilesData,
      citizens: citizenMap
    };
  }

  /**
   * Deserialize city from saved data
   * @param {Object} data - Serialized city data
   * @returns {City} Restored city instance
   */
  static deserialize(data) {
    // Create new city with saved size and name
    const city = new City(data.metadata.citySize, data.metadata.cityName);

    // Restore time manager
    city.timeManager.deserialize(data.timeManager);

    // Restore economy service
    const economyService = city.services.find(s => s.constructor.name === 'EconomyService');
    if (economyService && data.economy) {
      economyService.deserialize(data.economy);
    }

    // Restore disaster service
    const disasterService = city.services.find(s => s.constructor.name === 'DisasterService');
    if (disasterService && data.disasters) {
      disasterService.deserialize(data.disasters, city);
    }

    // Restore simTime
    city.simTime = data.metadata.simTime || 0;

    // Phase 1: Restore all buildings
    for (const tileData of data.tiles) {
      const tile = city.getTile(tileData.x, tileData.y);
      if (!tile) continue;

      // Set terrain
      tile.terrain = tileData.terrain;

      // Create building from saved data
      const building = createBuilding(tileData.x, tileData.y, tileData.building.type);

      // Restore building-specific state
      building.damageState = tileData.building.damageState || 0;
      building.power.required = tileData.building.power.required;
      building.power.supplied = tileData.building.power.supplied;
      building.roadAccess.value = tileData.building.roadAccess.value;
      building.roadAccess.enabled = tileData.building.roadAccess.enabled;

      // Restore zone-specific data
      if (building.development && tileData.building.development) {
        building.style = tileData.building.style;
        building.rotation.y = tileData.building.rotation || 0;
        building.development.state = tileData.building.development.state;
        building.development.level = tileData.building.development.level;
        building.development.constructionCounter = tileData.building.development.constructionCounter || 0;
        building.development.abandonmentCounter = tileData.building.development.abandonmentCounter || 0;
      }

      // Restore road style
      if (building.type === 'road' && tileData.building.style) {
        building.style = tileData.building.style;
        building.rotation.y = tileData.building.rotation || 0;
      }

      // Restore power plant data
      if (building.type === 'power-plant' && tileData.building.powerCapacity) {
        building.powerCapacity = tileData.building.powerCapacity;
        building.powerConsumed = tileData.building.powerConsumed;
        building.disabled = tileData.building.disabled || false;
      }

      // Restore building name
      if (tileData.building.name) {
        building.name = tileData.building.name;
      }

      // Place building on tile
      tile.setBuilding(building);
      building.x = tileData.x;
      building.y = tileData.y;
      building.position.set(tileData.x, 0, tileData.y);
      city.root.add(building);
    }

    // Phase 2: Restore all citizens and link them to buildings
    const citizenInstances = new Map();

    for (const [citizenId, citizenData] of Object.entries(data.citizens)) {
      const citizen = Citizen.deserialize(citizenData, city);
      if (citizen) {
        citizenInstances.set(citizenId, citizen);

        // Restore profession by name lookup
        if (citizen._professionName && Professions[citizen._professionName]) {
          citizen.profession = Professions[citizen._professionName];
        }
      }
    }

    // Phase 3: Re-link citizens to residential buildings and workplaces
    for (const tileData of data.tiles) {
      const tile = city.getTile(tileData.x, tileData.y);
      if (!tile?.building) continue;

      // Link residents to residential buildings
      if (tile.building.type === 'residential' && tileData.building.residents) {
        tile.building.residents.setResidents([]);
        for (const citizenId of tileData.building.residents) {
          const citizen = citizenInstances.get(citizenId);
          if (citizen) {
            tile.building.residents.addResident(citizen);
          }
        }
      }

      // Link workers to commercial/industrial buildings
      if ((tile.building.type === 'commercial' || tile.building.type === 'industrial') && tileData.building.workers) {
        tile.building.jobs.workers = [];
        for (const citizenId of tileData.building.workers) {
          const citizen = citizenInstances.get(citizenId);
          if (citizen) {
            tile.building.jobs.workers.push(citizen);

            // Restore workplace reference
            if (citizen._workplaceId === `${tile.x},${tile.y}`) {
              citizen.workplace = tile.building;
            }
          }
        }
      }
    }

    // Clean up temporary properties
    for (const citizen of citizenInstances.values()) {
      delete citizen._workplaceId;
      delete citizen._professionName;
    }

    // Refresh all building views
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile?.building) {
          tile.building.refreshView(city);
        }
      }
    }

    return city;
  }
}