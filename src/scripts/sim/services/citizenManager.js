import * as THREE from 'three';
import { SimService } from './simService.js';

/**
 * Manages visual representation of all citizens in the city
 * Implements "Digital Twin" architecture - every citizen has a 3D presence
 */
export class CitizenManager extends SimService {
  /**
   * Group containing all citizen meshes
   * @type {THREE.Group}
   */
  citizenGroup = new THREE.Group();

  /**
   * Map of citizen ID to mesh
   * @type {Map<string, THREE.Mesh>}
   */
  citizenMeshes = new Map();

  /**
   * Map of citizen ID to position history (for trails)
   * @type {Map<string, Array<{x: number, y: number, z: number, time: number}>>}
   */
  positionHistory = new Map();

  /**
   * Group containing all trail lines
   * @type {THREE.Group}
   */
  trailGroup = new THREE.Group();

  /**
   * Material for different citizen states
   * @type {Object}
   */
  materials = {
    employed: new THREE.MeshStandardMaterial({ color: 0x4CAF50 }), // Green
    unemployed: new THREE.MeshStandardMaterial({ color: 0xFFC107 }), // Yellow
    school: new THREE.MeshStandardMaterial({ color: 0x2196F3 }), // Blue
    retired: new THREE.MeshStandardMaterial({ color: 0x9E9E9E }), // Gray
    idle: new THREE.MeshStandardMaterial({ color: 0xFFFFFF }) // White
  };

  /**
   * Geometry for citizen mesh (shared across all citizens for performance)
   * @type {THREE.CapsuleGeometry}
   */
  citizenGeometry;

  /**
   * Maximum citizens to render (performance limit)
   * @type {number}
   */
  maxVisibleCitizens = 1000;

  /**
   * Max trail history length (points)
   * @type {number}
   */
  maxTrailLength = 100;

  /**
   * Trail update interval (only record position every N frames)
   * @type {number}
   */
  trailUpdateCounter = 0;
  trailUpdateInterval = 5;

  constructor() {
    super();
    // Create shared geometry for all citizens
    // Small capsule to represent a person (0.3 units tall)
    this.citizenGeometry = new THREE.CapsuleGeometry(0.05, 0.2, 4, 8);
    this.citizenGroup.name = 'Citizens';
    this.trailGroup.name = 'Citizen Trails';
  }

  /**
   * Get all citizens from all residential buildings
   * @param {City} city
   * @returns {Citizen[]}
   */
  #getAllCitizens(city) {
    const citizens = [];
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile.building?.type === 'residential' && tile.building.residents) {
          // Access private residents array through the count check
          // We need to modify ResidentsModule to expose citizens
          const residents = tile.building.residents.getResidents?.();
          if (residents) {
            citizens.push(...residents);
          }
        }
      }
    }
    return citizens;
  }

  /**
   * Update citizen visuals
   * @param {City} city
   */
  simulate(city) {
    const citizens = this.#getAllCitizens(city);

    // Limit number of visible citizens for performance
    const visibleCitizens = citizens.slice(0, this.maxVisibleCitizens);

    // Update existing citizens and create new ones
    const activeCitizenIds = new Set();

    for (const citizen of visibleCitizens) {
      activeCitizenIds.add(citizen.id);

      // Get or create mesh for this citizen
      let mesh = this.citizenMeshes.get(citizen.id);

      if (!mesh) {
        mesh = this.#createCitizenMesh(citizen);
        this.citizenMeshes.set(citizen.id, mesh);
        this.citizenGroup.add(mesh);
        // Initialize empty position history
        this.positionHistory.set(citizen.id, []);
      }

      // Update mesh position and appearance
      this.#updateCitizenMesh(mesh, citizen, city);

      // Update position history for trails
      this.#updatePositionHistory(citizen.id, mesh.position);
    }

    // Remove meshes for citizens that no longer exist
    for (const [citizenId, mesh] of this.citizenMeshes.entries()) {
      if (!activeCitizenIds.has(citizenId)) {
        this.citizenGroup.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.citizenMeshes.delete(citizenId);
        this.positionHistory.delete(citizenId);
      }
    }

    // Update trails (only if someone is being followed)
    if (window.game?.cameraManager?.followTarget) {
      this.#updateTrails();
    }

    this.trailUpdateCounter++;
  }

  /**
   * Create a mesh for a citizen
   * @param {Citizen} citizen
   * @returns {THREE.Mesh}
   */
  #createCitizenMesh(citizen) {
    const material = this.#getMaterialForState(citizen.state);
    const mesh = new THREE.Mesh(this.citizenGeometry, material);

    // Store citizen reference
    mesh.userData.citizen = citizen;
    mesh.userData.type = 'citizen'; // Mark as selectable
    mesh.castShadow = true;
    mesh.receiveShadow = false;

    // Position at residence initially
    const position = this.#getPositionForCitizen(citizen, null);
    mesh.position.copy(position);

    return mesh;
  }

  /**
   * Update citizen mesh position and appearance
   * @param {THREE.Mesh} mesh
   * @param {Citizen} citizen
   * @param {City} city
   */
  #updateCitizenMesh(mesh, citizen, city) {
    // Update material based on state
    const newMaterial = this.#getMaterialForState(citizen.state);
    if (mesh.material !== newMaterial) {
      mesh.material = newMaterial;
    }

    // Update position based on current activity
    const targetPosition = this.#getPositionForCitizen(citizen, city);

    // Smoothly interpolate to target position (simple lerp)
    mesh.position.lerp(targetPosition, 0.1);

    // Ensure citizens are above ground
    mesh.position.y = Math.max(0.15, mesh.position.y);
  }

  /**
   * Get material for citizen state
   * @param {string} state
   * @returns {THREE.Material}
   */
  #getMaterialForState(state) {
    return this.materials[state] || this.materials.idle;
  }

  /**
   * Get 3D position for citizen based on their current position
   * @param {Citizen} citizen
   * @param {City} city
   * @returns {THREE.Vector3}
   */
  #getPositionForCitizen(citizen, city) {
    // Use citizen's tracked position (includes movement interpolation)
    const offset = this.#getRandomOffset(citizen.id);

    return new THREE.Vector3(
      citizen.position.x + offset.x,
      0.15, // Height above ground
      citizen.position.y + offset.y
    );
  }

  /**
   * Get consistent random offset for a citizen (based on ID)
   * This ensures citizens don't all stand in exact same spot
   * @param {string} citizenId
   * @returns {{x: number, y: number}}
   */
  #getRandomOffset(citizenId) {
    // Use citizen ID to generate consistent random offset
    const hash = this.#hashCode(citizenId);
    const random1 = ((hash & 0xFF) / 255) - 0.5;
    const random2 = (((hash >> 8) & 0xFF) / 255) - 0.5;

    return {
      x: random1 * 0.4, // Spread within 0.4 units
      y: random2 * 0.4
    };
  }

  /**
   * Simple hash function for string
   * @param {string} str
   * @returns {number}
   */
  #hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Update position history for a citizen
   * @param {string} citizenId
   * @param {THREE.Vector3} position
   */
  #updatePositionHistory(citizenId, position) {
    // Only record position every N frames to save memory
    if (this.trailUpdateCounter % this.trailUpdateInterval !== 0) {
      return;
    }

    let history = this.positionHistory.get(citizenId);
    if (!history) {
      history = [];
      this.positionHistory.set(citizenId, history);
    }

    // Add current position with timestamp
    history.push({
      x: position.x,
      y: position.y,
      z: position.z,
      time: Date.now()
    });

    // Remove old positions
    if (history.length > this.maxTrailLength) {
      history.shift();
    }
  }

  /**
   * Update trail visualization for followed citizen
   */
  #updateTrails() {
    // Clear previous trails
    this.trailGroup.clear();

    const followTarget = window.game?.cameraManager?.followTarget;
    if (!followTarget || !followTarget.userData.citizen) {
      return;
    }

    const citizenId = followTarget.userData.citizen.id;
    const history = this.positionHistory.get(citizenId);

    if (!history || history.length < 2) {
      return;
    }

    // Create line geometry from position history
    const points = history.map(pos => new THREE.Vector3(pos.x, 0.1, pos.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create gradient material (fades from transparent to opaque)
    const colors = [];
    for (let i = 0; i < points.length; i++) {
      const alpha = i / points.length; // Fade in over trail
      colors.push(alpha, alpha, alpha); // RGB (white with varying alpha)
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x4CAF50, // Green trail
      linewidth: 2,
      transparent: true,
      opacity: 0.6,
      vertexColors: true
    });

    const trail = new THREE.Line(geometry, material);
    this.trailGroup.add(trail);
  }

  /**
   * Add citizen group to scene
   * @param {THREE.Scene} scene
   */
  addToScene(scene) {
    scene.add(this.citizenGroup);
    scene.add(this.trailGroup);
  }

  /**
   * Clean up resources
   */
  dispose() {
    // Remove all citizen meshes
    for (const [citizenId, mesh] of this.citizenMeshes.entries()) {
      this.citizenGroup.remove(mesh);
      // Don't dispose shared geometry
      mesh.material.dispose();
    }
    this.citizenMeshes.clear();

    // Clear position history
    this.positionHistory.clear();

    // Clear trails
    this.trailGroup.clear();

    // Dispose shared geometry
    this.citizenGeometry.dispose();

    // Dispose materials
    for (const material of Object.values(this.materials)) {
      material.dispose();
    }
  }
}
