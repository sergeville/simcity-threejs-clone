/**
 * Generates natural terrain with forests, rivers, hills, lakes, and oceans
 */
export class TerrainGenerator {
  /**
   * Generate terrain for the city
   * @param {number} size - Size of the city grid
   * @returns {string[][]} 2D array of terrain types
   */
  static generate(size) {
    // Create base grass terrain
    const terrain = [];
    for (let x = 0; x < size; x++) {
      terrain[x] = [];
      for (let y = 0; y < size; y++) {
        terrain[x][y] = 'grass';
      }
    }

    // Add natural features in order
    this.#addOcean(terrain, size);
    this.#addLakes(terrain, size);
    this.#addRivers(terrain, size);
    this.#addHills(terrain, size);
    this.#addForests(terrain, size);
    this.#addBeaches(terrain, size);

    return terrain;
  }

  /**
   * Add ocean around the edges
   * @param {string[][]} terrain
   * @param {number} size
   */
  static #addOcean(terrain, size) {
    const oceanDepth = Math.floor(size * 0.1); // 10% ocean border

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        // Create ocean at edges with some randomness
        const distFromEdge = Math.min(x, y, size - 1 - x, size - 1 - y);
        const oceanChance = Math.max(0, (oceanDepth - distFromEdge) / oceanDepth);

        if (Math.random() < oceanChance) {
          terrain[x][y] = 'ocean';
        }
      }
    }
  }

  /**
   * Add lakes using Perlin-like noise
   * @param {string[][]} terrain
   * @param {number} size
   */
  static #addLakes(terrain, size) {
    const numLakes = Math.floor(size / 16); // Scale with map size

    for (let i = 0; i < numLakes; i++) {
      const centerX = Math.floor(Math.random() * size * 0.8 + size * 0.1);
      const centerY = Math.floor(Math.random() * size * 0.8 + size * 0.1);
      const radius = 3 + Math.floor(Math.random() * 5);

      for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
          if (x >= 0 && x < size && y >= 0 && y < size) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (dist < radius && terrain[x][y] !== 'ocean') {
              if (Math.random() < 0.8) {
                terrain[x][y] = 'water';
              }
            }
          }
        }
      }
    }
  }

  /**
   * Add winding rivers
   * @param {string[][]} terrain
   * @param {number} size
   */
  static #addRivers(terrain, size) {
    const numRivers = Math.floor(size / 20);

    for (let i = 0; i < numRivers; i++) {
      // Start from a random edge
      let x = Math.random() < 0.5 ? 0 : size - 1;
      let y = Math.floor(Math.random() * size);

      // Alternate start
      if (Math.random() < 0.5) {
        [x, y] = [y, x];
      }

      let dx = x === 0 ? 1 : -1;
      let dy = Math.random() < 0.5 ? 1 : -1;

      const riverLength = size * 0.6;

      for (let step = 0; step < riverLength; step++) {
        if (x >= 0 && x < size && y >= 0 && y < size) {
          if (terrain[x][y] !== 'ocean') {
            terrain[x][y] = 'water';

            // Make river wider occasionally
            if (Math.random() < 0.3) {
              if (x + 1 < size && terrain[x + 1][y] !== 'ocean') terrain[x + 1][y] = 'water';
              if (y + 1 < size && terrain[x][y + 1] !== 'ocean') terrain[x][y + 1] = 'water';
            }
          }
        }

        // Winding river - change direction randomly
        if (Math.random() < 0.3) {
          dy = Math.random() < 0.5 ? 1 : -1;
        }
        if (Math.random() < 0.2) {
          dx = Math.random() < 0.5 ? 1 : -1;
        }

        x += dx;
        y += dy;
      }
    }
  }

  /**
   * Add hills and mountains
   * @param {string[][]} terrain
   * @param {number} size
   */
  static #addHills(terrain, size) {
    const numHillRanges = Math.floor(size / 24);

    for (let i = 0; i < numHillRanges; i++) {
      const centerX = Math.floor(Math.random() * size * 0.6 + size * 0.2);
      const centerY = Math.floor(Math.random() * size * 0.6 + size * 0.2);
      const radius = 4 + Math.floor(Math.random() * 6);

      for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
          if (x >= 0 && x < size && y >= 0 && y < size) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

            if (terrain[x][y] === 'grass' || terrain[x][y] === 'forest') {
              if (dist < radius * 0.4 && Math.random() < 0.7) {
                terrain[x][y] = 'mountain';
              } else if (dist < radius * 0.7 && Math.random() < 0.6) {
                terrain[x][y] = 'hill';
              }
            }
          }
        }
      }
    }
  }

  /**
   * Add forests in clusters
   * @param {string[][]} terrain
   * @param {number} size
   */
  static #addForests(terrain, size) {
    const numForests = Math.floor(size / 8);

    for (let i = 0; i < numForests; i++) {
      const centerX = Math.floor(Math.random() * size);
      const centerY = Math.floor(Math.random() * size);
      const radius = 2 + Math.floor(Math.random() * 4);

      for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
          if (x >= 0 && x < size && y >= 0 && y < size) {
            if (terrain[x][y] === 'grass' && Math.random() < 0.7) {
              terrain[x][y] = 'forest';
            }
          }
        }
      }
    }
  }

  /**
   * Add beaches next to water
   * @param {string[][]} terrain
   * @param {number} size
   */
  static #addBeaches(terrain, size) {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (terrain[x][y] === 'grass') {
          // Check if adjacent to water
          const hasWaterNeighbor =
            (x > 0 && (terrain[x-1][y] === 'water' || terrain[x-1][y] === 'ocean')) ||
            (x < size - 1 && (terrain[x+1][y] === 'water' || terrain[x+1][y] === 'ocean')) ||
            (y > 0 && (terrain[x][y-1] === 'water' || terrain[x][y-1] === 'ocean')) ||
            (y < size - 1 && (terrain[x][y+1] === 'water' || terrain[x][y+1] === 'ocean'));

          if (hasWaterNeighbor && Math.random() < 0.6) {
            terrain[x][y] = 'beach';
          }
        }
      }
    }
  }

  /**
   * Check if terrain is buildable
   * @param {string} terrainType
   * @returns {boolean}
   */
  static isBuildable(terrainType) {
    return terrainType === 'grass' ||
           terrainType === 'beach' ||
           terrainType === 'hill';
  }

  /**
   * Get terrain color for visualization
   * @param {string} terrainType
   * @returns {number} Hex color
   */
  static getTerrainColor(terrainType) {
    const colors = {
      grass: 0x4a8f4a,      // Green
      forest: 0x2d5016,     // Dark green
      water: 0x3498db,      // Blue
      ocean: 0x1e3a8a,      // Dark blue
      beach: 0xf4d03f,      // Sand yellow
      hill: 0x8b7355,       // Brown
      mountain: 0x95a5a6    // Gray
    };
    return colors[terrainType] || 0x4a8f4a;
  }
}
