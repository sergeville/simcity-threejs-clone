# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a SimCity clone built with Three.js and Vite. The project is a city-building simulation game where players can place buildings, roads, and manage city services like power. The game runs in the browser and features a 3D isometric view.

## Commands

```bash
npm run dev        # Start development server on http://127.0.0.1:3000
npm run build      # Build for production (output to src/dist)
npm run preview    # Preview production build
```

## Architecture

### Core Structure

The application follows a **game engine pattern** with clear separation between simulation logic and rendering:

- **Game** (`src/scripts/game.js`): Main Three.js scene manager. Handles rendering, raycasting for object selection, camera management, and the game loop. Runs simulation updates every 1000ms.
- **City** (`src/scripts/sim/city.js`): Central data model representing the city. Contains a 2D grid of `Tile` objects, manages building placement/demolition, and coordinates simulation updates across all tiles and services.
- **UI** (`src/scripts/ui.js`): Global UI manager exposed as `window.ui`. Handles tool selection, pause state, and info panel updates.
- **AssetManager** (`src/scripts/assets/assetManager.js`): Global singleton exposed as `window.assetManager`. Loads all 3D models (GLB format) and textures on startup. Models are cloned for each instance with unique materials.

### Simulation System

The game uses a **module-based simulation architecture**:

- **SimObject** (`src/scripts/sim/simObject.js`): Base class for all game objects (tiles, buildings). Manages mesh association and provides `simulate()`, `dispose()`, and `toHTML()` hooks.
- **SimModule** (`src/scripts/sim/buildings/modules/simModule.js`): Base class for building modules (composition over inheritance pattern). Each building is composed of multiple modules:
  - **PowerModule**: Tracks power supply/demand
  - **RoadAccessModule**: Checks connectivity to road network
  - **DevelopmentModule**: Handles zone development/abandonment/leveling
  - **ResidentsModule**: Manages population in residential zones
  - **JobsModule**: Manages employment in commercial/industrial zones

### Building System

Buildings are created via factory pattern:

- **BuildingFactory** (`src/scripts/sim/buildings/buildingFactory.js`): Creates building instances based on type string.
- **BuildingType** (`src/scripts/sim/buildings/buildingType.js`): Enum of available building types.
- **Building hierarchy**:
  - `Building` (base class) → `Zone` (residential/commercial/industrial)
  - `Building` → `Road`, `PowerPlant`, `PowerLine`

Zones have a **development lifecycle**:

1. Undeveloped → Under Construction → Developed
2. Can level up (1-3) based on conditions
3. Can become abandoned if criteria not met (no power, no road access)
4. Can be redeveloped after conditions improve

### Services System

- **SimService** (`src/scripts/sim/services/simService.js`): Base class for city-wide services.
- **PowerService** (`src/scripts/sim/services/power.js`): Manages electricity distribution across the city using a graph-based propagation algorithm.

### Vehicle System

- **VehicleGraph** (`src/scripts/sim/vehicles/vehicleGraph.js`): Maintains a navigation graph of roads. Spawns vehicles at intervals that travel along roads using A* pathfinding.
- Vehicles fade in/out at spawn/despawn and have configurable speed, lifetime, and spawn intervals (see `config.js`).

### Tile System

- **Tile** (`src/scripts/sim/tile.js`): Represents a single grid cell. Contains optional building and terrain type. Acts as the scene graph node positioning buildings at integer (x, y) coordinates.
- Tiles support neighbor queries and distance calculations for pathfinding/search algorithms.

### Input and Camera

- **InputManager** (`src/scripts/input.js`): Tracks mouse position and button states.
- **CameraManager** (`src/scripts/camera.js`): Manages orthographic camera with pan/zoom controls.

### Configuration

All simulation parameters are centralized in `src/scripts/config.js`:

- Module settings (development times, abandonment thresholds, resident limits)
- Citizen behavior (working age, job search distance)
- Vehicle settings (speed, spawn rate, max lifetime)

## Key Patterns and Conventions

1. **Global singletons**: `window.game`, `window.ui`, and `window.assetManager` are global instances created on page load.

2. **Raycasting for selection**: The Game class uses Three.js raycasting to determine which object is under the mouse. Selected objects are stored in `userData` property of meshes.

3. **Mesh management**: Buildings call `setMesh()` to replace their visual representation. The parent class handles cleanup of old meshes.

4. **Two-phase updates**:
   - `simulate()` updates data model
   - `refreshView()` updates visual representation
   - These are called separately to avoid thrashing

5. **Coordinate system**: City uses a 2D grid (x, y) mapped to 3D space. Buildings are positioned at integer coordinates.

6. **Tool system**: UI maintains an `activeToolId` that determines behavior when clicking tiles (select, bulldoze, or place specific building type).

## Project Structure

```text
src/
├── index.html              # Entry point
├── public/                 # Static assets
│   ├── models/            # GLB 3D models
│   ├── icons/             # UI icons
│   ├── fonts/             # Custom fonts
│   └── main.css           # Global styles
├── scripts/
│   ├── game.js            # Main game engine
│   ├── ui.js              # UI manager
│   ├── camera.js          # Camera controls
│   ├── input.js           # Input handling
│   ├── config.js          # Simulation configuration
│   ├── assets/            # Asset loading
│   └── sim/               # Simulation logic
│       ├── city.js        # City data model
│       ├── tile.js        # Grid tile
│       ├── simObject.js   # Base game object
│       ├── buildings/     # Building types and modules
│       ├── services/      # City services
│       └── vehicles/      # Vehicle pathfinding
```

## Important Notes

- The project uses Vite with custom config for GitHub Pages deployment (`base: '/simcity-threejs-clone/'`)
- Project root is set to `./src` in vite.config.js
- All 3D models use a shared texture atlas (`base.png` and `specular.png`) applied via custom material in AssetManager
- Models are scaled to 1/30th size and rotated via metadata in `models.js`
- The simulation runs at 1 update per second (1000ms interval) independent of render loop
- Game uses TWO render layers: layer 0 for normal objects, layer 1 for status icons (rendered without depth test)
