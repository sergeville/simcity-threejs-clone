# Simulation Architecture

## Overview

The simulation runs at 1 Hz (1 update per second), independent of the rendering loop (60 FPS). This separation allows consistent game logic regardless of frame rate.

## Simulation Loop

### Main Loop
**File**: `src/scripts/game.js`

```javascript
// In Game.start()
setInterval(() => {
  if (!ui.isPaused) {
    this.city.simulate();  // Update game state
    this.updateUI();       // Update UI displays
  }
}, 1000);  // 1000ms = 1 second
```

### City.simulate()
**File**: `src/scripts/sim/city.js`

```javascript
simulate(steps = 1) {
  let count = 0;
  while (count++ < steps) {
    // 1. Update time manager
    this.timeManager.tick();

    // 2. Update services (city-wide systems)
    this.services.forEach(service => service.simulate(this));

    // 3. Update each tile (buildings)
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        this.getTile(x, y).simulate(this);
      }
    }
  }
  this.simTime++;  // Legacy day counter
}
```

## Update Order

**Critical**: Services update before tiles

1. **TimeManager** - Updates day/night cycle
2. **Services** (in order):
   - EconomyService - Process finances
   - PowerService - Distribute electricity
   - DisasterService - Spawn/update disasters
   - CitizenManager - Update citizen behavior
   - VisualEffectsService - Update visual effects
3. **Tiles** - Update each building

**Why this order?**
- Services set city-wide state
- Buildings react to that state
- Example: PowerService updates power grid, then buildings check if they have power

## Two-Phase Update Pattern

### Phase 1: simulate() - Data Model

Updates game state without touching visuals:

```javascript
simulate(city) {
  // Update data
  this.population += growthRate;
  this.happiness = calculateHappiness();
  this.powerRequired = calculatePower();

  // Check conditions
  if (this.happiness < 20) {
    this.abandonmentTimer++;
  }

  // No mesh/material changes here!
}
```

### Phase 2: refreshView() - Visual

Updates visual representation based on data:

```javascript
refreshView(city) {
  // Update mesh based on state
  const modelName = this.isAbandoned ? 'abandoned' : this.getModelName();
  const mesh = assetManager.getModel(modelName);
  this.setMesh(mesh);

  // Update materials
  if (this.onFire) {
    this.mesh.material.emissive.setHex(0xff4400);
  }
}
```

**When called?**
- `simulate()`: Every tick (1 Hz)
- `refreshView()`: When state changes or building placed

## Module Composition

Buildings use modules for functionality:

### SimModule Base Class
**File**: `src/scripts/sim/buildings/modules/simModule.js`

```javascript
export class SimModule {
  constructor(building) {
    this.building = building;
  }

  simulate(city) {
    // Override in subclass
  }

  dispose() {
    // Cleanup if needed
  }
}
```

### Example Modules

**PowerModule**: Tracks power supply/demand
```javascript
class PowerModule extends SimModule {
  required = 10;  // kW needed
  supplied = 0;   // kW available

  simulate(city) {
    // Check power grid via PowerService
    // Update supplied based on grid state
  }

  get isFullyPowered() {
    return this.supplied >= this.required;
  }
}
```

**RoadAccessModule**: Checks road connectivity
```javascript
class RoadAccessModule extends SimModule {
  value = false;

  simulate(city) {
    // Check adjacent tiles for roads
    this.value = this.#hasAdjacentRoad(city);
  }
}
```

### Building Simulation

**File**: `src/scripts/sim/buildings/building.js`

```javascript
simulate(city) {
  super.simulate(city);

  // Update all modules
  this.power.simulate(city);
  this.roadAccess.simulate(city);

  // Update status icon based on modules
  if (!this.power.isFullyPowered) {
    this.setStatus(BuildingStatus.NoPower);
  } else if (!this.roadAccess.value) {
    this.setStatus(BuildingStatus.NoRoadAccess);
  } else {
    this.setStatus(null);
  }
}
```

## Time Management

### TimeManager
**File**: `src/scripts/sim/timeManager.js`

**Tracks**:
- In-game time (hours:minutes)
- Day counter
- Time of day (morning/day/evening/night)

**Usage**:
```javascript
const { currentDay, currentHour, currentMinute } = city.timeManager;
const timeOfDay = city.timeManager.getTimeOfDay();

if (timeOfDay === 'night') {
  // Reduce citizen activity
}
```

**Time progression**:
- 1 real second = 1 in-game minute (configurable)
- 24 in-game hours = 24 real minutes
- Day/night cycle affects citizen behavior

## Service Update Details

### PowerService

**Algorithm**:
1. Reset all power levels to 0
2. Find all power plants
3. Propagate power through connected power lines
4. Update building power levels

**Graph-based**:
- Power lines form a graph
- Breadth-first search from each plant
- Buildings connected to powered lines receive power

### DisasterService

**Spawn logic**:
1. Increment counter each tick
2. Every N ticks, check for disaster spawn
3. Roll random number against disaster chance
4. If triggered, spawn random disaster type

**Update logic**:
1. Update each active disaster
2. Check if disaster expired
3. Run cleanup if expired
4. Remove from active list

### EconomyService

**Tax collection**:
- Collect taxes from employed citizens
- Collect taxes from businesses
- Update city funds

**Expenses**:
- Service building upkeep
- Employee salaries

### CitizenManager

**Path finding**:
- Citizens move between home and work
- A* pathfinding on road network
- Update citizen mesh positions

**Activity updates**:
- Working citizens at commercial/industrial buildings
- Students at schools
- Retired citizens at home

## Configuration

### Global Config
**File**: `src/scripts/config.js`

```javascript
export const config = {
  modules: {
    development: {
      timeToConstruct: 10,  // Ticks until built
      abandonmentDelay: 20   // Ticks until abandoned
    }
  },
  citizens: {
    workingAge: 18,
    retirementAge: 65,
    jobSearchDistance: 10
  },
  vehicles: {
    speed: 0.05,
    spawnInterval: 30,
    maxLifetime: 100
  }
};
```

**Usage**:
```javascript
import { config } from '../config.js';

this.constructionTime = config.modules.development.timeToConstruct;
```

## State Management

### Building State

```javascript
class Zone extends Building {
  // Development state
  developmentStage = 'undeveloped';  // undeveloped, constructing, developed
  level = 1;  // 1-3
  isAbandoned = false;

  // Timers
  constructionTimer = 0;
  abandonmentTimer = 0;

  simulate(city) {
    if (this.developmentStage === 'constructing') {
      this.constructionTimer++;
      if (this.constructionTimer >= config.modules.development.timeToConstruct) {
        this.developmentStage = 'developed';
        this.refreshView(city);
      }
    }
  }
}
```

### Tile State

```javascript
class Tile extends SimObject {
  x; y;           // Grid position
  terrain;        // Terrain type
  building;       // Optional building

  simulate(city) {
    // Delegate to building if present
    this.building?.simulate(city);
  }
}
```

## Common Patterns

### Neighbor Checking

```javascript
simulate(city) {
  const neighbors = [
    city.getTile(this.x - 1, this.y),
    city.getTile(this.x + 1, this.y),
    city.getTile(this.x, this.y - 1),
    city.getTile(this.x, this.y + 1)
  ].filter(t => t !== null);

  // Process neighbors
}
```

### Radius Search

```javascript
simulate(city) {
  const radius = 5;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const tile = city.getTile(this.x + dx, this.y + dy);
        // Process tile
      }
    }
  }
}
```

### Conditional Timers

```javascript
simulate(city) {
  if (this.condition) {
    this.timer++;
    if (this.timer >= this.threshold) {
      this.doAction();
      this.timer = 0;  // Reset
    }
  } else {
    this.timer = Math.max(0, this.timer - 1);  // Decay
  }
}
```

## Debugging

### Logging

```javascript
simulate(city) {
  if (this.debug) {
    console.log(`[${this.constructor.name}] State:`, {
      population: this.population,
      happiness: this.happiness,
      power: this.power.supplied
    });
  }
}
```

### Performance Monitoring

```javascript
simulate(city) {
  const start = performance.now();

  // ... simulation code ...

  const elapsed = performance.now() - start;
  if (elapsed > 16) {  // > 16ms = < 60 FPS
    console.warn(`Slow simulation: ${elapsed.toFixed(2)}ms`);
  }
}
```

### Browser Console

```javascript
// Access simulation state
const city = window.game.city;
city.simulate(10);  // Run 10 steps manually

// Check specific building
const tile = city.getTile(5, 5);
console.log(tile.building);
```

## Performance Considerations

### Optimization Tips

1. **Cache calculations**: Don't recalculate every tick
```javascript
// Bad
simulate(city) {
  const distance = Math.sqrt((x - tx) ** 2 + (y - ty) ** 2);
}

// Good
constructor() {
  this.#cachedDistance = this.#calculateDistance();
}
```

2. **Early exits**: Skip unnecessary work
```javascript
simulate(city) {
  if (!this.enabled) return;
  if (this.counter++ % this.updateInterval !== 0) return;
  // Do expensive work
}
```

3. **Batch updates**: Group similar operations
```javascript
simulate(city) {
  // Collect all buildings first
  const hospitals = [];
  for (let x = 0; x < city.size; x++) {
    for (let y = 0; y < city.size; y++) {
      if (city.getTile(x, y)?.building?.type === 'hospital') {
        hospitals.push(city.getTile(x, y).building);
      }
    }
  }

  // Process in batch
  hospitals.forEach(h => h.provideHealthcare(city));
}
```

### Profiling

Use browser DevTools:
1. Open Performance tab
2. Start recording
3. Let simulation run for 10-20 seconds
4. Stop recording
5. Analyze which methods take longest

## Testing

### Manual Testing

```javascript
// In browser console
const city = window.game.city;

// Fast-forward time
for (let i = 0; i < 100; i++) {
  city.simulate();
}

// Check state
console.log('Population:', city.population);
console.log('Funds:', city.economy.funds);
```

### Verification

```javascript
simulate(city) {
  // Validate state
  console.assert(this.population >= 0, 'Negative population!');
  console.assert(this.happiness <= 100, 'Happiness over 100!');
}
```

## Related Documentation

- [Services](services.md) - Service system details
- [Rendering](rendering.md) - How rendering integrates
- [CLAUDE.md](../../CLAUDE.md) - Full architecture overview
- [Config](../../src/scripts/config.js) - Simulation parameters

---

**Last Updated**: 2026-01-13
