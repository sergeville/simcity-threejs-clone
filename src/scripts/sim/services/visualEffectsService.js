import * as THREE from 'three';
import { SimService } from './simService.js';

/**
 * Manages visual effects like fire, smoke, and damage states
 */
export class VisualEffectsService extends SimService {
  /**
   * Map of tile ID to fire effects
   * @type {Map<string, Object>}
   */
  #fireEffects = new Map();

  /**
   * Map of tile ID to damage overlays
   * @type {Map<string, THREE.Mesh>}
   */
  #damageOverlays = new Map();

  /**
   * Map of citizen ID to emotion sprites
   * @type {Map<string, THREE.Sprite>}
   */
  #emotionSprites = new Map();

  /**
   * Canvas for creating emotion emoji textures
   * @type {HTMLCanvasElement}
   */
  #emojiCanvas;

  /**
   * Group containing all visual effects
   * @type {THREE.Group}
   */
  effectsGroup = new THREE.Group();

  /**
   * Particle geometry (shared for all fire particles)
   * @type {THREE.BufferGeometry}
   */
  #particleGeometry;

  /**
   * Fire particle material
   * @type {THREE.PointsMaterial}
   */
  #fireParticleMaterial;

  /**
   * Smoke particle material
   * @type {THREE.PointsMaterial}
   */
  #smokeParticleMaterial;

  constructor() {
    super();
    this.#initializeParticleSystems();
    this.#initializeEmojiCanvas();
  }

  /**
   * Initialize particle system materials and geometry
   */
  #initializeParticleSystems() {
    // Create fire particle material (orange-red)
    this.#fireParticleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      color: 0xff4400,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Create smoke particle material (dark gray)
    this.#smokeParticleMaterial = new THREE.PointsMaterial({
      size: 0.5,
      color: 0x555555,
      transparent: true,
      opacity: 0.4,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    // Shared particle geometry
    this.#particleGeometry = new THREE.BufferGeometry();
    const particleCount = 20;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }

    this.#particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }

  /**
   * Initialize canvas for creating emoji textures
   */
  #initializeEmojiCanvas() {
    this.#emojiCanvas = document.createElement('canvas');
    this.#emojiCanvas.width = 64;
    this.#emojiCanvas.height = 64;
  }

  /**
   * Simulate visual effects
   * @param {City} city
   */
  simulate(city) {
    // Update fire effects
    this.#updateFireEffects(city);

    // Update damage overlays
    this.#updateDamageOverlays(city);
  }

  /**
   * Update all fire effects
   * @param {City} city
   */
  #updateFireEffects(city) {
    // Check all buildings for fire status
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const tileId = `${x},${y}`;

        if (tile?.building?.onFire) {
          // Add fire effect if not already present
          if (!this.#fireEffects.has(tileId)) {
            this.#createFireEffect(tile, tileId);
          }

          // Update existing fire effect
          this.#animateFireEffect(tileId);
        } else {
          // Remove fire effect if present
          if (this.#fireEffects.has(tileId)) {
            this.#removeFireEffect(tileId);
          }
        }
      }
    }
  }

  /**
   * Create fire effect for a tile
   * @param {Tile} tile
   * @param {string} tileId
   */
  #createFireEffect(tile, tileId) {
    const effectGroup = new THREE.Group();
    effectGroup.position.set(tile.x, 0.5, tile.y);

    // Create fire particles
    const fireParticles = new THREE.Points(
      this.#particleGeometry.clone(),
      this.#fireParticleMaterial.clone()
    );
    effectGroup.add(fireParticles);

    // Create smoke particles (offset upward)
    const smokeParticles = new THREE.Points(
      this.#particleGeometry.clone(),
      this.#smokeParticleMaterial.clone()
    );
    smokeParticles.position.y = 1;
    effectGroup.add(smokeParticles);

    // Create glowing overlay for the building
    const glowGeometry = new THREE.PlaneGeometry(1, 1);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.y = 0.1;
    effectGroup.add(glowMesh);

    // Add to scene
    this.effectsGroup.add(effectGroup);

    // Store reference with animation data
    this.#fireEffects.set(tileId, {
      group: effectGroup,
      fireParticles,
      smokeParticles,
      glowMesh,
      animationTime: 0
    });
  }

  /**
   * Animate fire effect
   * @param {string} tileId
   */
  #animateFireEffect(tileId) {
    const effect = this.#fireEffects.get(tileId);
    if (!effect) return;

    effect.animationTime += 0.1;

    // Animate fire particles (flickering)
    const firePositions = effect.fireParticles.geometry.attributes.position.array;
    for (let i = 0; i < firePositions.length; i += 3) {
      // Add upward movement and random jitter
      firePositions[i + 1] += 0.02 + Math.random() * 0.01;
      firePositions[i] += (Math.random() - 0.5) * 0.02;
      firePositions[i + 2] += (Math.random() - 0.5) * 0.02;

      // Reset particles that go too high
      if (firePositions[i + 1] > 2) {
        firePositions[i + 1] = Math.random() * 0.5;
        firePositions[i] = (Math.random() - 0.5) * 0.8;
        firePositions[i + 2] = (Math.random() - 0.5) * 0.8;
      }
    }
    effect.fireParticles.geometry.attributes.position.needsUpdate = true;

    // Animate smoke particles (slower, more dispersed)
    const smokePositions = effect.smokeParticles.geometry.attributes.position.array;
    for (let i = 0; i < smokePositions.length; i += 3) {
      smokePositions[i + 1] += 0.01;
      smokePositions[i] += (Math.random() - 0.5) * 0.03;
      smokePositions[i + 2] += (Math.random() - 0.5) * 0.03;

      // Reset particles that go too high
      if (smokePositions[i + 1] > 3) {
        smokePositions[i + 1] = 0;
        smokePositions[i] = (Math.random() - 0.5) * 0.8;
        smokePositions[i + 2] = (Math.random() - 0.5) * 0.8;
      }
    }
    effect.smokeParticles.geometry.attributes.position.needsUpdate = true;

    // Pulse the glow overlay
    effect.glowMesh.material.opacity = 0.2 + Math.sin(effect.animationTime) * 0.1;

    // Flicker the fire color
    const flicker = Math.sin(effect.animationTime * 5) * 0.1 + 0.9;
    effect.fireParticles.material.opacity = 0.6 + flicker * 0.2;
  }

  /**
   * Remove fire effect
   * @param {string} tileId
   */
  #removeFireEffect(tileId) {
    const effect = this.#fireEffects.get(tileId);
    if (!effect) return;

    // Clean up geometries and materials
    effect.fireParticles.geometry.dispose();
    effect.smokeParticles.geometry.dispose();
    effect.fireParticles.material.dispose();
    effect.smokeParticles.material.dispose();
    effect.glowMesh.geometry.dispose();
    effect.glowMesh.material.dispose();

    // Remove from scene
    this.effectsGroup.remove(effect.group);

    // Remove from map
    this.#fireEffects.delete(tileId);
  }

  /**
   * Update damage overlays for all buildings
   * @param {City} city
   */
  #updateDamageOverlays(city) {
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const tileId = `${x},${y}`;

        if (tile?.building && tile.building.damageState > 0) {
          // Add or update damage overlay
          if (!this.#damageOverlays.has(tileId)) {
            this.#createDamageOverlay(tile, tileId);
          } else {
            this.#updateDamageOverlay(tile, tileId);
          }
        } else {
          // Remove damage overlay if present
          if (this.#damageOverlays.has(tileId)) {
            this.#removeDamageOverlay(tileId);
          }
        }
      }
    }
  }

  /**
   * Create damage overlay for a building
   * @param {Tile} tile
   * @param {string} tileId
   */
  #createDamageOverlay(tile, tileId) {
    const damageState = tile.building.damageState;
    const geometry = new THREE.PlaneGeometry(1, 1);

    // Damage color and opacity based on severity
    let color, opacity;
    switch (damageState) {
      case 1: // Light damage
        color = 0x888888;
        opacity = 0.2;
        break;
      case 2: // Moderate damage
        color = 0x666666;
        opacity = 0.4;
        break;
      case 3: // Heavy damage
        color = 0x222222;
        opacity = 0.6;
        break;
      default:
        color = 0x888888;
        opacity = 0.2;
    }

    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const overlay = new THREE.Mesh(geometry, material);
    overlay.rotation.x = -Math.PI / 2;
    overlay.position.set(tile.x, 0.6, tile.y); // Slightly above ground

    this.effectsGroup.add(overlay);
    this.#damageOverlays.set(tileId, overlay);
  }

  /**
   * Update damage overlay appearance
   * @param {Tile} tile
   * @param {string} tileId
   */
  #updateDamageOverlay(tile, tileId) {
    const overlay = this.#damageOverlays.get(tileId);
    if (!overlay) return;

    const damageState = tile.building.damageState;

    // Update color and opacity based on damage state
    switch (damageState) {
      case 1:
        overlay.material.color.setHex(0x888888);
        overlay.material.opacity = 0.2;
        break;
      case 2:
        overlay.material.color.setHex(0x666666);
        overlay.material.opacity = 0.4;
        break;
      case 3:
        overlay.material.color.setHex(0x222222);
        overlay.material.opacity = 0.6;
        break;
    }
  }

  /**
   * Remove damage overlay
   * @param {string} tileId
   */
  #removeDamageOverlay(tileId) {
    const overlay = this.#damageOverlays.get(tileId);
    if (!overlay) return;

    overlay.geometry.dispose();
    overlay.material.dispose();
    this.effectsGroup.remove(overlay);
    this.#damageOverlays.delete(tileId);
  }

  /**
   * Remove all effects for a specific tile (called when building is demolished)
   * @param {number} x
   * @param {number} y
   */
  removeEffectsForTile(x, y) {
    const tileId = `${x},${y}`;

    // Remove fire effect if present
    if (this.#fireEffects.has(tileId)) {
      this.#removeFireEffect(tileId);
    }

    // Remove damage overlay if present
    if (this.#damageOverlays.has(tileId)) {
      this.#removeDamageOverlay(tileId);
    }
  }

  /**
   * Clean up all effects
   */
  dispose() {
    // Remove all fire effects
    for (const tileId of this.#fireEffects.keys()) {
      this.#removeFireEffect(tileId);
    }

    // Remove all damage overlays
    for (const tileId of this.#damageOverlays.keys()) {
      this.#removeDamageOverlay(tileId);
    }

    // Clean up shared materials and geometry
    this.#fireParticleMaterial.dispose();
    this.#smokeParticleMaterial.dispose();
    this.#particleGeometry.dispose();
  }
}
