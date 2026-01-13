/**
 * SaveManager - Handles game state persistence to localStorage
 */
export class SaveManager {
  static SAVE_KEY = 'simcity-clone-save';
  static VERSION = '1.0.0';

  /**
   * Save game state to localStorage
   * @param {City} city - The city instance to save
   * @returns {boolean} - Success status
   */
  static save(city) {
    try {
      const saveData = city.serialize();
      const jsonString = JSON.stringify(saveData);

      // Check size (warn if > 5MB)
      const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
      if (sizeInMB > 5) {
        console.warn(`Save file is ${sizeInMB.toFixed(2)}MB - approaching localStorage limits`);
      }

      localStorage.setItem(this.SAVE_KEY, jsonString);
      console.log(`Game saved successfully (${sizeInMB.toFixed(2)}MB)`);

      return true;
    } catch (error) {
      console.error('Failed to save game:', error);

      // If quota exceeded, offer download
      if (error.name === 'QuotaExceededError') {
        this.downloadSave(city);
        alert('localStorage quota exceeded! Save file has been downloaded instead.');
      }

      return false;
    }
  }

  /**
   * Load game state from localStorage
   * @returns {Object|null} - Parsed save data or null if no save exists
   */
  static load() {
    try {
      const jsonString = localStorage.getItem(this.SAVE_KEY);

      if (!jsonString) {
        console.log('No saved game found');
        return null;
      }

      const saveData = JSON.parse(jsonString);

      // Version check
      if (saveData.version !== this.VERSION) {
        console.warn(`Save file version mismatch: ${saveData.version} vs ${this.VERSION}`);
        // Attempt migration
        return this.migrate(saveData);
      }

      console.log('Save file loaded successfully');
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Check if a save file exists
   * @returns {boolean}
   */
  static hasSave() {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * Delete save file
   */
  static deleteSave() {
    localStorage.removeItem(this.SAVE_KEY);
    console.log('Save file deleted');
  }

  /**
   * Download save file as JSON
   * @param {City} city - The city instance to save
   */
  static downloadSave(city) {
    const saveData = city.serialize();
    const jsonString = JSON.stringify(saveData, null, 2);
    const blob = new Blob([jsonString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `simcity-save-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    console.log('Save file downloaded');
  }

  /**
   * Import save file from JSON upload
   * @param {File} file - The uploaded file
   * @param {Function} callback - Callback function with parsed data
   */
  static importFromFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target.result);
        callback(saveData);
      } catch (error) {
        console.error('Failed to parse save file:', error);
        callback(null);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Migrate old save format to current version
   * @param {Object} saveData - The old save data
   * @returns {Object} - Migrated save data
   */
  static migrate(saveData) {
    const migrations = {
      '0.9.0': this.migrateFrom_0_9_0.bind(this),
      '1.0.0': (data) => data // No migration needed
    };

    let currentData = saveData;
    const fromVersion = saveData.version || '0.9.0';

    // Apply migrations in sequence
    for (const [version, migrateFn] of Object.entries(migrations)) {
      if (this.versionLessThan(fromVersion, version)) {
        console.log(`Migrating from ${fromVersion} to ${version}`);
        currentData = migrateFn(currentData);
        currentData.version = version;
      }
    }

    return currentData;
  }

  /**
   * Migration from version 0.9.0
   * @param {Object} data - Save data
   * @returns {Object} - Migrated data
   */
  static migrateFrom_0_9_0(data) {
    // Example: Add new fields with defaults
    if (!data.timeManager) {
      data.timeManager = {
        currentHour: 8,
        currentDay: 0,
        currentTick: 0,
        totalTicks: 0,
        ticksPerHour: 60,
        tickInterval: 1000
      };
    }
    return data;
  }

  /**
   * Compare version strings
   * @param {string} v1 - First version
   * @param {string} v2 - Second version
   * @returns {boolean} - True if v1 < v2
   */
  static versionLessThan(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] < parts2[i]) return true;
      if (parts1[i] > parts2[i]) return false;
    }
    return false;
  }
}

// Make SaveManager globally accessible
window.SaveManager = SaveManager;
