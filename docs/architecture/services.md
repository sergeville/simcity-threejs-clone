# Service Architecture

## Overview

Services are city-wide systems that run every simulation tick and affect multiple tiles/buildings. They follow a consistent pattern for modularity and maintainability.

## Service Pattern

### Base Class: SimService

All services extend `SimService` (`src/scripts/sim/services/simService.js`):

```javascript
export class SimService {
  /**
   * Simulates one step of the service
   * @param {City} city - The city instance
   */
  simulate(city) {
    // Override in subclass
  }

  /**
   * Cleanup resources
   */
  dispose() {
    // Override if needed
  }
}
```

### Creating a New Service

**File location**: `src/scripts/sim/services/yourService.js`

**Template**:
```javascript
import { SimService } from './simService.js';

export class YourService extends SimService {
  constructor() {
    super();
    // Initialize service state
  }

  simulate(city) {
    // Update service state each tick
    // Access city via city.getTile(x, y)
    // Access other services via city.services
  }

  dispose() {
    // Clean up resources if needed
    super.dispose();
  }
}
```

**Integration** (in `src/scripts/sim/city.js`):
```javascript
import { YourService } from './services/yourService.js';

// In City constructor
this.services.push(new YourService());
```

## Existing Services

### PowerService
**Purpose**: Manages electricity distribution across the city

**Key features**:
- Graph-based power propagation
- Tracks power supply/demand
- Disables unpowered buildings

**File**: `src/scripts/sim/services/power.js`

### DisasterService
**Purpose**: Spawns and manages random disasters (fires, floods, power outages)

**Key features**:
- Configurable difficulty levels
- Multiple disaster types
- Emergency response integration

**File**: `src/scripts/sim/services/disasterService.js`

### VisualEffectsService
**Purpose**: Creates and manages visual effects (fire particles, damage overlays)

**Key features**:
- Three.js particle systems
- Damage state visualization
- Automatic cleanup

**File**: `src/scripts/sim/services/visualEffectsService.js`

### EconomyService
**Purpose**: Manages city finances and economic flow

**Key features**:
- Income/expense tracking
- Citizen employment economics
- Building costs

**File**: `src/scripts/sim/services/economy.js`

### CitizenManager
**Purpose**: Manages citizen visualization and movement

**Key features**:
- 3D citizen models
- Path finding
- Activity display

**File**: `src/scripts/sim/services/citizenManager.js`

## Service Lifecycle

1. **Construction**: Service created in City constructor
2. **Registration**: Added to `city.services` array
3. **Simulation**: `simulate(city)` called every tick
4. **Access**: Other systems access via `city.services.find(s => s instanceof ServiceType)`
5. **Disposal**: `dispose()` called when city is destroyed

## Service Communication

### Accessing Other Services

```javascript
// In a service's simulate() method
simulate(city) {
  const economy = city.services.find(s => s instanceof EconomyService);
  if (economy) {
    economy.deductFunds(100);
  }
}
```

### Accessing from Buildings

```javascript
// In a building's simulate() method
simulate(city) {
  const disasterService = city.services.find(s => s instanceof DisasterService);
  if (disasterService && this.onFire) {
    // React to disaster
  }
}
```

## Best Practices

### Do's ✅
- Keep services focused on a single responsibility
- Use services for city-wide logic
- Make services stateful (they persist across ticks)
- Clean up resources in `dispose()`
- Document service parameters

### Don'ts ❌
- Don't put building-specific logic in services
- Don't directly modify building state (use building methods)
- Don't create circular dependencies between services
- Don't forget to add service to City constructor

## Common Patterns

### Iterating All Tiles

```javascript
simulate(city) {
  for (let x = 0; x < city.size; x++) {
    for (let y = 0; y < city.size; y++) {
      const tile = city.getTile(x, y);
      if (tile?.building) {
        // Do something with building
      }
    }
  }
}
```

### Finding Specific Buildings

```javascript
simulate(city) {
  for (let x = 0; x < city.size; x++) {
    for (let y = 0; y < city.size; y++) {
      const tile = city.getTile(x, y);
      if (tile?.building?.type === 'hospital') {
        // Found a hospital
      }
    }
  }
}
```

### Service Configuration

Store configuration in the service:

```javascript
export class MyService extends SimService {
  enabled = true;
  updateInterval = 10;
  #counter = 0;

  simulate(city) {
    if (!this.enabled) return;

    this.#counter++;
    if (this.#counter >= this.updateInterval) {
      this.#counter = 0;
      this.#doUpdate(city);
    }
  }
}
```

## Examples

### Simple Service

```javascript
// Track city statistics
export class StatisticsService extends SimService {
  totalBuildings = 0;
  totalPopulation = 0;

  simulate(city) {
    this.totalBuildings = 0;
    this.totalPopulation = 0;

    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile?.building) {
          this.totalBuildings++;
          this.totalPopulation += tile.building.residents?.count ?? 0;
        }
      }
    }
  }
}
```

### Advanced Service with Sub-systems

```javascript
export class TrafficService extends SimService {
  #congestionMap = new Map();

  simulate(city) {
    this.#calculateCongestion(city);
    this.#updateVehicleSpeeds(city);
  }

  #calculateCongestion(city) {
    this.#congestionMap.clear();
    // Calculate traffic on each road
  }

  #updateVehicleSpeeds(city) {
    // Slow down vehicles on congested roads
  }

  getCongestion(x, y) {
    return this.#congestionMap.get(`${x},${y}`) ?? 0;
  }
}
```

## Testing Services

**Manual testing**:
1. Add service to City
2. Run simulation
3. Verify service updates correctly
4. Check browser console for errors
5. Verify performance (services run every tick!)

**Common issues**:
- Service not running → Check City constructor registration
- Performance problems → Optimize loops, use caching
- State not persisting → Check service isn't recreated each tick

## Related Documentation

- [Simulation Loop](simulation.md) - How services fit into the game loop
- [CLAUDE.md](../../CLAUDE.md) - Full architecture overview
- [Module Pattern](../features/disasters.md) - Building-level composition

---

**Last Updated**: 2026-01-13
