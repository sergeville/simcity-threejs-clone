# Disaster System Documentation

## Overview

The disaster system adds random events that challenge players to maintain their city while responding to emergencies. It includes three disaster types with visual effects, damage mechanics, and emergency response systems.

**Version**: 1.0
**Added**: 2026-01-13

---

## Features

### Disaster Types

#### 🔥 Fire
- **Duration**: Burns for 30 steps
- **Spread Behavior**: 30% chance to spread to adjacent buildings (once per fire)
- **Effects**:
  - Marks building as `onFire`
  - Damages citizen health (-5/step) and safety (-10/step)
  - Creates visual fire and smoke particles
  - Pulsing orange glow effect
- **Damage on Cleanup**:
  - 15% chance: Complete destruction
  - 20% chance: Heavy damage (state 3)
  - 25% chance: Moderate damage (state 2)
  - 25% chance: Light damage (state 1)
  - 15% chance: No damage
- **Fire Station Response**: Fire stations within 12 tiles reduce fire duration by 5 steps per simulation tick

#### 💧 Flood
- **Duration**: Lasts for 20 steps
- **Affected Area**: 5-tile radius from spawn point
- **Effects**:
  - Gradual damage to citizens (-2 health, -3 safety per step)
  - Area-of-effect damage to all buildings in radius
- **Damage on Cleanup** (per building in radius):
  - 5% chance: Complete destruction
  - 10% chance: Heavy damage (state 3)
  - 15% chance: Moderate damage (state 2)
  - 20% chance: Light damage (state 1)
  - 50% chance: No damage

#### ⚡ Power Outage
- **Duration**: 50 steps
- **Target**: Random power plant
- **Effects**:
  - Disables power plant (`disabled = true`)
  - Cuts off electricity to connected buildings
  - No structural damage
- **Cleanup**: Power plant automatically re-enabled

---

## Damage System

### Damage States

Buildings track damage in 4 levels:
- **0**: No damage (pristine)
- **1**: Light damage (20% opacity gray overlay)
- **2**: Moderate damage (40% opacity darker gray overlay)
- **3**: Heavy damage (60% opacity very dark gray overlay)

### Damage Persistence

- Damage accumulates from multiple disasters
- Damage does not automatically heal
- Buildings retain damage until repaired by hospitals

---

## Repair Mechanic

### Hospital Repair System

**Requirements**:
- Hospital must be within service radius (8 tiles) of damaged building
- Hospital effectiveness must be ≥50%

**Repair Rate**:
- Base chance: 5% per step (at 100% effectiveness)
- Scaled by hospital effectiveness: `(effectiveness / 100) * 0.05`
- Repairs reduce damage state by 1 level per successful check

**Notifications**:
- Activity feed shows when building is fully repaired
- Example: "🏥 Building at (12, 8) fully repaired"

---

## Visual Effects System

### Fire Effects (`VisualEffectsService`)

**Components per fire**:
1. **Fire Particles** (20 particles)
   - Orange-red color (#ff4400)
   - Additive blending for glow
   - Upward animation with flickering
   - Reset when reaching height limit

2. **Smoke Particles** (20 particles)
   - Dark gray color (#555555)
   - Positioned 1 unit above fire
   - Slower rise, more dispersion
   - Normal blending

3. **Ground Glow**
   - Pulsing orange overlay
   - Horizontal plane at ground level
   - Opacity varies: 0.2 + sin(time) * 0.1

**Performance**:
- Shared particle geometry (cloned per fire)
- Shared materials (cloned per effect)
- Proper disposal on cleanup

### Damage Overlays

**Appearance**:
- Horizontal semi-transparent planes
- Positioned 0.6 units above ground
- Color/opacity based on damage state

**Cleanup**:
- Automatically removed when building is demolished
- Removed when damage state returns to 0

---

## Difficulty Settings

### Levels

| Level | Name | Enabled | Disaster Chance | Check Interval | Icon |
|-------|------|---------|-----------------|----------------|------|
| 0 | None | No | N/A | N/A | 🛡️ |
| 1 | Easy | Yes | 2% | 150 steps | ⚠️ |
| 2 | Normal | Yes | 5% | 100 steps | 🔥 |
| 3 | Hard | Yes | 10% | 75 steps | 💀 |

### UI Control

**Button**: Orange fire emoji button in toolbar
**Behavior**: Cycles through difficulty levels (None → Easy → Normal → Hard → None)
**Visual Feedback**:
- Button color changes per difficulty
- Tooltip shows current level
- Activity feed notification on change

---

## Architecture

### Service Pattern

**DisasterService** (`src/scripts/sim/services/disasterService.js`)
- Extends `SimService`
- Manages active disasters array
- Spawns random disasters periodically
- Updates and cleans up expired disasters

**VisualEffectsService** (`src/scripts/sim/services/visualEffectsService.js`)
- Extends `SimService`
- Tracks fire effects and damage overlays by tile ID
- Automatically syncs with building states
- Provides cleanup API for demolition

### Integration Points

1. **City.js**
   - Instantiates DisasterService and VisualEffectsService
   - Adds visual effects group to scene
   - Calls `removeEffectsForTile()` on bulldoze

2. **Building.js**
   - Tracks `damageState` (0-3)
   - Property can be set by disasters

3. **Hospital.js**
   - Implements `repairBuildings()` method
   - Scans service radius for damaged buildings
   - Probabilistic repair based on effectiveness

4. **UI.js**
   - Provides `toggleDisasterDifficulty()` method
   - Updates button appearance on change

---

## Code Examples

### Checking if Building is On Fire

```javascript
const tile = city.getTile(x, y);
if (tile?.building?.onFire) {
  // Building is burning
}
```

### Manually Setting Damage

```javascript
building.damageState = 2; // Set to moderate damage
```

### Accessing Disaster Service

```javascript
const disasterService = city.services.find(s => s instanceof DisasterService);
disasterService.setDifficulty(3); // Set to Hard
```

### Removing Effects on Demolition

```javascript
// Automatically called in City.bulldoze()
const visualEffects = city.services.find(s => s instanceof VisualEffectsService);
visualEffects.removeEffectsForTile(x, y);
```

---

## Activity Feed Integration

### Disaster Events

All disasters post notifications to the activity feed:

**Fire**:
- `🔥 FIRE at (x, y)! Fire department responding...` (spawn)
- `🔥 Fire spreading to (x, y)!` (spread)
- `💥 Building at (x, y) destroyed by fire!` (destruction)
- `🔥 Building at (x, y) heavily damaged by fire` (heavy damage)

**Flood**:
- `💧 FLOOD near (x, y)! Area affected.` (spawn)

**Power Outage**:
- `⚡ POWER OUTAGE at power plant (x, y)!` (spawn)
- `⚡ Power restored at (x, y)` (cleanup)

**Repairs**:
- `🏥 Building at (x, y) fully repaired` (hospital repair complete)

**Difficulty Changes**:
- `⚙️ Disaster difficulty set to: [Level]` (user action)

---

## Configuration

### DisasterService Properties

```javascript
disasterService.enabled = true;           // Enable/disable system
disasterService.difficulty = 2;           // 0-3 difficulty level
disasterService.disasterChance = 0.05;    // Probability per check
disasterService.#checkInterval = 100;     // Steps between checks
```

### Adjusting Fire Behavior

**Fire class** (inner class in disasterService.js):
```javascript
this.duration = 30;           // How long fire burns
this.spreadChance = 0.3;      // 30% chance to spread
```

**Fire Station Response Range**:
```javascript
// In Fire.#checkFireStationResponse()
for (let dx = -12; dx <= 12; dx++) {  // 12-tile radius
  for (let dy = -12; dy <= 12; dy++) {
    // Check for fire stations
  }
}
```

### Adjusting Flood Behavior

**Flood class**:
```javascript
this.radius = 5;     // Tiles affected from center
this.duration = 20;  // How long flood lasts
```

### Adjusting Power Outage Behavior

**PowerOutage class**:
```javascript
this.duration = 50;  // Steps until power restored
```

---

## Testing Checklist

- [x] Fire spawns and burns correctly
- [x] Fire spreads to adjacent buildings
- [x] Fire station reduces fire duration
- [x] Fire damage states applied correctly
- [x] Flood spawns with radius effect
- [x] Flood damages citizens in area
- [x] Flood applies building damage on cleanup
- [x] Power outage disables power plant
- [x] Power outage restores after duration
- [x] Visual effects (fire/smoke) render correctly
- [x] Damage overlays appear with correct opacity
- [x] Effects cleanup when building bulldozed
- [x] Hospital repairs damaged buildings
- [x] Repair notifications in activity feed
- [x] Difficulty toggle cycles correctly
- [x] Difficulty button updates appearance
- [x] Difficulty affects disaster frequency
- [x] Multiple simultaneous disasters handled
- [x] Activity feed shows all disaster events

---

## Future Enhancements

### Potential Features

1. **Additional Disasters**
   - Earthquakes (wide-area damage)
   - Tornadoes (path-based destruction)
   - Meteor strikes (single-tile devastation)

2. **Advanced Response**
   - Manual fire truck dispatch
   - Emergency services coordination
   - Evacuation mechanics

3. **Economic Impact**
   - Repair costs (deduct from economy)
   - Insurance system
   - Federal aid after major disasters

4. **Weather System Integration**
   - Floods more likely near water
   - Fires more likely in dry seasons
   - Weather affects disaster probability

5. **Player Agency**
   - Emergency preparedness investments
   - Building fire resistance upgrades
   - Early warning systems

6. **Difficulty Tuning**
   - Custom difficulty with sliders
   - Per-disaster type frequency control
   - Damage severity multipliers

---

## Known Issues

1. **Power Outage Targeting**: Always targets first power plant found - should randomize
2. **Particle Performance**: Many simultaneous fires may impact FPS - consider object pooling
3. **Spread Limitation**: Fires only spread once - could allow multiple spread attempts for realism

---

## API Reference

### DisasterService

```javascript
class DisasterService extends SimService {
  // Properties
  enabled: boolean
  difficulty: number (0-3)
  disasterChance: number
  activeDisasters: Array

  // Methods
  setDifficulty(level: number): void
  getDifficultyName(): string
  simulate(city: City): void
}
```

### VisualEffectsService

```javascript
class VisualEffectsService extends SimService {
  // Properties
  effectsGroup: THREE.Group

  // Methods
  removeEffectsForTile(x: number, y: number): void
  simulate(city: City): void
  dispose(): void
}
```

### Building Damage

```javascript
class Building {
  // Properties
  damageState: number (0-3)
  onFire: boolean (optional)
  disabled: boolean (optional, for power plants)
}
```

### Hospital Repair

```javascript
class Hospital extends ServiceBuilding {
  // Methods
  repairBuildings(city: City): void
  provideHealthcare(city: City): void
}
```

---

## File Manifest

### New Files
- `src/scripts/sim/services/disasterService.js` - Main disaster logic
- `src/scripts/sim/services/visualEffectsService.js` - Visual effects system
- `DISASTER_SYSTEM.md` - This documentation

### Modified Files
- `src/scripts/sim/city.js` - Service integration, bulldoze cleanup
- `src/scripts/sim/buildings/building.js` - Added `damageState` property
- `src/scripts/sim/buildings/services/hospital.js` - Added repair mechanic
- `src/scripts/ui.js` - Added difficulty toggle
- `src/index.html` - Added difficulty button
- `src/public/main.css` - Citizen stats panel styling

---

## Credits

**Design**: Based on SimCity disaster mechanics
**Implementation**: Custom Three.js particle system
**Architecture**: Service-based modular pattern

---

**Last Updated**: 2026-01-13
**Version**: 1.0
