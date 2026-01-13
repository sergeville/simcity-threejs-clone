import * as THREE from 'three';
import { Building } from './buildings/building.js';
import { SimObject } from './simObject.js';
import { TerrainGenerator } from './terrainGenerator.js';

export class Tile extends SimObject {
  /**
   * The type of terrain
   * @type {string}
   */
  terrain = 'grass';
  /**
   * The building on this tile
   * @type {Building?}
   */
  #building = null;

  constructor(x, y) {
    super(x, y);
    this.name = `Tile-${this.x}-${this.y}`;
  }

  /**
   * @type {Building}
   */
  get building() {
    return this.#building;
  }

  /**
   * @type {Building} value
   */
  setBuilding(value) {
    // Remove and dispose resources for existing building
    if (this.#building) {
      this.#building.dispose();
      this.remove(this.#building);
    }

    this.#building = value;

    // Add to scene graph
    if (value) {
      this.add(this.#building);
    }
  }

  refreshView(city) {
    this.building?.refreshView(city);
    if (this.building?.hideTerrain) {
      this.setMesh(null);
    } else {
      // Create terrain mesh based on type
      const terrainColor = TerrainGenerator.getTerrainColor(this.terrain);
      const geometry = new THREE.BoxGeometry(1, 0.1, 1);
      const material = new THREE.MeshLambertMaterial({
        color: terrainColor
      });

      // Add height variation for hills and mountains
      if (this.terrain === 'hill') {
        geometry.scale(1, 2, 1); // 2x height
      } else if (this.terrain === 'mountain') {
        geometry.scale(1, 4, 1); // 4x height
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = this.terrain;
      mesh.userData = this;
      mesh.receiveShadow = true;
      mesh.castShadow = this.terrain === 'mountain' || this.terrain === 'hill';

      this.setMesh(mesh);
    }
  }

  simulate(city) {
    this.building?.simulate(city);
  }

  /**
   * Gets the Manhattan distance between two tiles
   * @param {Tile} tile 
   * @returns 
   */
  distanceTo(tile) {
    return Math.abs(this.x - tile.x) + Math.abs(this.y - tile.y);
  }

  /**
   * 
   * @returns {string} HTML representation of this object
   */
  toHTML() {
    let html = `
      <div class="info-heading">Tile</div>
      <span class="info-label">Coordinates </span>
      <span class="info-value">X: ${this.x}, Y: ${this.y}</span>
      <br>
      <span class="info-label">Terrain </span>
      <span class="info-value">${this.terrain}</span>
      <br>
    `;

    if (this.building) {
      html += this.building.toHTML();
    }

    return html;
  }
};