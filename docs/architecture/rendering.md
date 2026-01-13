# Rendering Architecture

## Overview

The game uses Three.js for 3D rendering with a custom scene graph and asset management system. Rendering is separate from simulation logic following the MVC pattern.

## Key Components

### Game Class
**File**: `src/scripts/game.js`

**Responsibilities**:
- Three.js scene management
- Render loop (60 FPS)
- Raycasting for object selection
- Camera management
- Simulation tick (1 Hz independent of render)

### Scene Graph

```
Scene
├── City (root group)
│   ├── root (game objects)
│   │   ├── Tiles[x][y]
│   │   │   ├── Terrain mesh
│   │   │   └── Building mesh
│   │   ├── CitizenManager.citizenGroup
│   │   └── VisualEffectsService.effectsGroup
│   └── debugMeshes (vehicle paths, grids)
└── Lights (ambient, directional)
```

## Render Layers

Three.js uses layers to control what gets rendered:

- **Layer 0**: Normal game objects (buildings, terrain, effects)
- **Layer 1**: Status icons (rendered without depth test, always on top)

**Setting layers**:
```javascript
// Normal object
mesh.layers.set(0);

// Status icon (always visible)
statusIcon.layers.set(1);
statusIcon.material = new THREE.SpriteMaterial({ depthTest: false });
```

## Asset Management

### AssetManager
**File**: `src/scripts/assets/assetManager.js`

**Singleton**: `window.assetManager`

**Responsibilities**:
- Load all GLB models on startup
- Load textures (shared texture atlas)
- Provide model clones for buildings
- Load status icons

### Shared Texture Atlas

All 3D models use the same texture:
- **base.png**: Color texture
- **specular.png**: Specular map

**Applied in AssetManager**:
```javascript
model.traverse((child) => {
  if (child.isMesh) {
    child.material = new THREE.MeshLambertMaterial({
      map: baseTexture,
      specularMap: specularTexture
    });
  }
});
```

### Model Loading

**Location**: `src/public/models/`

**Metadata**: `src/scripts/assets/models.js`
```javascript
{
  name: 'residential-1',
  model: '/models/residential-1.glb',
  scale: 1/30,  // Models scaled down
  rotation: Math.PI / 2  // Rotated to face correct direction
}
```

**Cloning models**:
```javascript
const mesh = window.assetManager.getModel('residential-1');
this.setMesh(mesh);  // Building method handles cleanup
```

## Mesh Management

### Building.setMesh()

Buildings manage their own visual representation:

```javascript
setMesh(mesh) {
  // Remove old mesh if exists
  if (this.mesh) {
    this.remove(this.mesh);
    // Material/geometry disposal handled by AssetManager
  }

  // Add new mesh
  this.mesh = mesh;
  if (mesh) {
    this.add(mesh);
  }
}
```

**Key points**:
- Buildings are Three.js Object3D instances
- Meshes are children of buildings
- Position/rotation handled by building
- Materials shared across instances

## Camera System

### CameraManager
**File**: `src/scripts/camera.js`

**Camera type**: `THREE.OrthographicCamera`
- Provides isometric view
- No perspective distortion
- Consistent scale at all distances

**Controls**:
- **Pan**: Ctrl + Right mouse drag
- **Rotate**: Right mouse drag
- **Zoom**: Mouse wheel

**Camera positioning**:
```javascript
// Isometric view
camera.position.set(16, 16, 16);
camera.lookAt(8, 0, 8);  // Center of 16x16 grid
```

## Raycasting for Selection

**File**: `src/scripts/game.js` (onMouseMove, onClick methods)

**How it works**:
1. Mouse position converted to normalized device coordinates
2. Raycaster created from camera and mouse position
3. Intersects calculated with scene objects
4. First intersection returned
5. Object data retrieved from `mesh.userData`

**Storing data in meshes**:
```javascript
// In Building/Tile
this.mesh.userData = this;  // Store reference to game object
```

**Retrieving on click**:
```javascript
const intersect = raycaster.intersectObjects(scene.children, true)[0];
const object = intersect?.object.userData;  // Get building/tile
```

## Two-Phase Rendering

### Simulate vs RefreshView

**Simulate** (data model):
```javascript
simulate(city) {
  // Update game logic
  this.population += 10;
  this.happiness -= 5;
  // No visual changes here
}
```

**RefreshView** (visual):
```javascript
refreshView(city) {
  // Update visual representation
  const mesh = assetManager.getModel(this.getModelName());
  this.setMesh(mesh);
  // Update material colors, add effects, etc.
}
```

**Why separate?**:
- Simulation runs 1 Hz
- Rendering runs 60 Hz
- Separating prevents visual thrashing
- Easier to test game logic

## Performance Considerations

### Object Pooling

Visual effects use object pooling for particles:

```javascript
// Share geometry across instances
this.#particleGeometry = new THREE.BufferGeometry();

// Clone when needed
const particles = new THREE.Points(
  this.#particleGeometry.clone(),
  this.#material.clone()
);
```

### Instancing (Not Yet Implemented)

Future optimization: Use `THREE.InstancedMesh` for repeated models like residential buildings.

### Disposal

Always dispose of Three.js resources:

```javascript
dispose() {
  if (this.mesh) {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.remove(this.mesh);
  }
}
```

## Visual Effects

### Particle Systems

**File**: `src/scripts/sim/services/visualEffectsService.js`

**Fire effects**:
- 20 fire particles (orange, additive blending)
- 20 smoke particles (gray, normal blending)
- Ground glow (pulsing orange overlay)

**Animation**:
```javascript
// Update particle positions each frame
for (let i = 0; i < positions.length; i += 3) {
  positions[i + 1] += 0.02;  // Move upward
  if (positions[i + 1] > maxHeight) {
    positions[i + 1] = 0;  // Reset
  }
}
geometry.attributes.position.needsUpdate = true;
```

### Material Effects

**Damage overlays**:
```javascript
const material = new THREE.MeshBasicMaterial({
  color: damageColor,
  transparent: true,
  opacity: damageOpacity,
  depthWrite: false  // Don't block objects behind
});
```

## Lighting

**Ambient light**: Low-intensity white light (illuminates all objects equally)

**Directional light**: Simulates sunlight
- Position: Top-right-front
- Creates shadows (if enabled)

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 5);
```

## Coordinate System

**Grid to 3D mapping**:
- Grid position (x, y) → 3D position (x, 0, y)
- Y-axis is height (always 0 for ground-level buildings)
- Origin (0, 0, 0) is top-left corner

**Centering camera**:
```javascript
const center = city.size / 2;
camera.lookAt(center, 0, center);
```

## Render Loop

**File**: `src/scripts/game.js`

```javascript
start() {
  const renderLoop = () => {
    // Update camera controls
    this.camera.update();

    // Update vehicles (move along paths)
    this.city.draw();

    // Render scene
    this.renderer.render(this.scene, this.camera.camera);

    // Continue loop
    requestAnimationFrame(renderLoop);
  };

  renderLoop();
}
```

**Separate simulation tick**:
```javascript
setInterval(() => {
  if (!ui.isPaused) {
    this.city.simulate();
    this.updateUI();
  }
}, 1000);  // 1 Hz
```

## Debugging

### Showing Debug Meshes

```javascript
// In City
this.debugMeshes = new THREE.Group();
this.debugMeshes.add(vehicleGraph);  // Vehicle paths

// Toggle visibility
this.debugMeshes.visible = showDebug;
```

### Browser Console

```javascript
// Access game objects in console
window.game  // Game instance
window.game.city  // City instance
window.game.city.getTile(5, 5)  // Specific tile
```

## Common Patterns

### Creating Meshes

```javascript
const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI / 2;  // Flat on ground
mesh.position.set(x, 0, y);
```

### Adding to Scene

```javascript
// Via building/tile (recommended)
tile.add(mesh);

// Via service
city.root.add(mesh);

// Debug only
city.debugMeshes.add(mesh);
```

### Updating Materials

```javascript
// Change color
mesh.material.color.setHex(0x00ff00);

// Change opacity
mesh.material.opacity = 0.5;
mesh.material.transparent = true;
mesh.material.needsUpdate = true;
```

## Related Documentation

- [Simulation Loop](simulation.md) - How rendering integrates with simulation
- [Services](services.md) - Visual effects service
- [CLAUDE.md](../../CLAUDE.md) - Full architecture overview

---

**Last Updated**: 2026-01-13
