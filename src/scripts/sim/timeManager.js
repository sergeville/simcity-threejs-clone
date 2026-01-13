/**
 * Manages simulation time with tick rates and delta time
 * Implements "Always Running" architecture concepts
 */
export class TimeManager {
  /**
   * Current simulation time in hours (0-24)
   * @type {number}
   */
  currentHour = 8; // Start at 8 AM

  /**
   * Current simulation day
   * @type {number}
   */
  currentDay = 0;

  /**
   * Ticks per in-game hour
   * @type {number}
   */
  ticksPerHour = 60; // 1 hour = 60 ticks = 60 seconds real time

  /**
   * Current tick within the hour
   * @type {number}
   */
  currentTick = 0;

  /**
   * Total ticks elapsed
   * @type {number}
   */
  totalTicks = 0;

  /**
   * Is simulation paused?
   * @type {boolean}
   */
  isPaused = false;

  /**
   * Last real-world timestamp
   * @type {number}
   */
  lastTickTime = Date.now();

  /**
   * Delta time accumulator
   * @type {number}
   */
  deltaAccumulator = 0;

  /**
   * Target tick interval in milliseconds
   * @type {number}
   */
  tickInterval = 1000; // 1 second per tick

  /**
   * Advance simulation by one tick
   */
  tick() {
    if (this.isPaused) return;

    const now = Date.now();
    const deltaTime = now - this.lastTickTime;
    this.lastTickTime = now;

    // Accumulate delta time
    this.deltaAccumulator += deltaTime;

    // Process accumulated ticks
    while (this.deltaAccumulator >= this.tickInterval) {
      this.deltaAccumulator -= this.tickInterval;
      this.#processTick();
    }
  }

  /**
   * Process a single simulation tick
   */
  #processTick() {
    this.currentTick++;
    this.totalTicks++;

    // Advance hour
    if (this.currentTick >= this.ticksPerHour) {
      this.currentTick = 0;
      this.currentHour++;

      // Advance day
      if (this.currentHour >= 24) {
        this.currentHour = 0;
        this.currentDay++;
      }
    }
  }

  /**
   * Get current time as formatted string
   * @returns {string}
   */
  getTimeString() {
    const hour = this.currentHour;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const minutes = Math.floor((this.currentTick / this.ticksPerHour) * 60);
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Get current time of day category
   * @returns {string} 'night', 'morning', 'day', 'evening'
   */
  getTimeOfDay() {
    if (this.currentHour >= 0 && this.currentHour < 6) return 'night';
    if (this.currentHour >= 6 && this.currentHour < 12) return 'morning';
    if (this.currentHour >= 12 && this.currentHour < 18) return 'day';
    return 'evening';
  }

  /**
   * Check if it's currently working hours
   * @returns {boolean}
   */
  isWorkingHours() {
    return this.currentHour >= 9 && this.currentHour < 17;
  }

  /**
   * Check if it's currently sleeping hours
   * @returns {boolean}
   */
  isSleepingHours() {
    return this.currentHour >= 22 || this.currentHour < 6;
  }

  /**
   * Pause simulation
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume simulation
   */
  resume() {
    this.isPaused = false;
    this.lastTickTime = Date.now();
    this.deltaAccumulator = 0;
  }

  /**
   * Speed up simulation (reduce tick interval)
   */
  speedUp() {
    this.tickInterval = Math.max(100, this.tickInterval / 2);
  }

  /**
   * Slow down simulation (increase tick interval)
   */
  slowDown() {
    this.tickInterval = Math.min(5000, this.tickInterval * 2);
  }

  /**
   * Reset to normal speed
   */
  normalSpeed() {
    this.tickInterval = 1000;
  }

  /**
   * Serialize time manager state
   * @returns {Object}
   */
  serialize() {
    return {
      currentHour: this.currentHour,
      currentDay: this.currentDay,
      currentTick: this.currentTick,
      totalTicks: this.totalTicks,
      ticksPerHour: this.ticksPerHour,
      tickInterval: this.tickInterval,
      deltaAccumulator: this.deltaAccumulator
    };
  }

  /**
   * Deserialize time manager state
   * @param {Object} data
   */
  deserialize(data) {
    this.currentHour = data.currentHour;
    this.currentDay = data.currentDay;
    this.currentTick = data.currentTick;
    this.totalTicks = data.totalTicks;
    this.ticksPerHour = data.ticksPerHour;
    this.tickInterval = data.tickInterval;
    this.deltaAccumulator = data.deltaAccumulator || 0;

    // Reset runtime state
    this.lastTickTime = Date.now();
    this.isPaused = false;
  }
}
