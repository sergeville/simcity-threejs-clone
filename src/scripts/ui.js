import { Game } from './game';
import { SimObject } from './sim/simObject';
import playIconUrl from '/icons/play-color.png';
import pauseIconUrl from '/icons/pause-color.png';

export class GameUI {
  /**
   * Currently selected tool
   * @type {string}
   */
  activeToolId = 'select';
  /**
   * @type {HTMLElement | null }
   */
  selectedControl = document.getElementById('button-select');
  /**
   * True if the game is currently paused
   * @type {boolean}
   */
  isPaused = false;
  /**
   * True if AI is controlling the game
   * @type {boolean}
   */
  isAIEnabled = false;

  get gameWindow() {
    return document.getElementById('render-target');
  }

  showLoadingText() {
    document.getElementById('loading').style.visibility = 'visible';
  }

  hideLoadingText() {
    document.getElementById('loading').style.visibility = 'hidden';
  }
  
  /**
   * 
   * @param {*} event 
   */
  onToolSelected(event) {
    // Deselect previously selected button and selected this one
    if (this.selectedControl) {
      this.selectedControl.classList.remove('selected');
    }
    this.selectedControl = event.target;
    this.selectedControl.classList.add('selected');

    this.activeToolId = this.selectedControl.getAttribute('data-type');
  }

  /**
   * Toggles the pause state of the game
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      document.getElementById('pause-button-icon').src = playIconUrl;
      document.getElementById('paused-text').style.visibility = 'visible';
    } else {
      document.getElementById('pause-button-icon').src = pauseIconUrl;
      document.getElementById('paused-text').style.visibility = 'hidden';
    }
  }

  /**
   * Updates the values in the title bar
   * @param {Game} game
   */
  updateTitleBar(game) {
    document.getElementById('city-name').innerHTML = game.city.name;
    document.getElementById('population-counter').innerHTML = game.city.population;

    // Display current time from TimeManager
    const timeManager = game.city.timeManager;
    console.log('TimeManager check:', timeManager); // DEBUG
    if (timeManager) {
      console.log('Using TimeManager for time display'); // DEBUG
      const timeString = timeManager.getTimeString();
      const dayString = `Day ${timeManager.currentDay}`;
      const timeOfDay = timeManager.getTimeOfDay();

      // Time of day emoji for visual feedback
      const timeEmoji = {
        'night': '🌙',
        'morning': '🌅',
        'day': '☀️',
        'evening': '🌆'
      }[timeOfDay] || '';

      document.getElementById('sim-time').innerHTML = `${timeEmoji} ${timeString} - ${dayString}`;
    } else {
      // Fallback to old date display if TimeManager not available
      console.log('TimeManager not available, using fallback'); // DEBUG
      const date = new Date('1/1/2023');
      date.setDate(date.getDate() + game.city.simTime);
      document.getElementById('sim-time').innerHTML = date.toLocaleDateString();
    }

    // Update budget display
    const economy = game.city.economy;
    if (economy) {
      const funds = Math.floor(economy.funds);
      document.getElementById('budget-display').innerHTML = `$${funds.toLocaleString()}`;

      // Color code based on financial health
      const budgetElement = document.getElementById('budget-display');
      if (funds < 0) {
        budgetElement.style.color = '#ff4444'; // Red for negative
      } else if (funds < 5000) {
        budgetElement.style.color = '#ffaa00'; // Orange for low funds
      } else {
        budgetElement.style.color = '#ffffff'; // White for healthy
      }
    }
  }

  /**
   * Toggle AI control
   */
  toggleAI() {
    if (window.game && window.game.aiAgent) {
      window.game.aiAgent.toggle();
      this.isAIEnabled = window.game.aiAgent.enabled;

      // Update button appearance
      const button = document.getElementById('button-ai');
      if (this.isAIEnabled) {
        button.style.backgroundColor = '#ff6600';
        button.style.borderColor = '#ff6600';
        button.querySelector('span').style.color = '#ffffff';
        button.title = 'AI Mayor: ACTIVE (Click to disable)';
      } else {
        button.style.backgroundColor = '';
        button.style.borderColor = '#ff6600';
        button.querySelector('span').style.color = '#ff6600';
        button.title = 'AI Mayor: Click to let AI control the city';
      }
    }
  }

  /**
   * Quit the city with confirmation
   */
  quitCity() {
    // Show confirmation dialog
    const confirmed = confirm('Really want to quit?\n\nThis will shut down the city and all progress will be lost.');

    if (confirmed) {
      // Stop the simulation
      if (window.game) {
        window.game.stop();
      }

      // Show shutdown overlay
      const shutdownOverlay = document.createElement('div');
      shutdownOverlay.className = 'text-overlay';
      shutdownOverlay.style.visibility = 'visible';
      shutdownOverlay.innerHTML = '<div>CITY SHUT DOWN<br><br><small>Refresh the page to start a new city</small></div>';
      document.getElementById('root-window').appendChild(shutdownOverlay);

      // Clear the scene
      if (window.game && window.game.scene) {
        window.game.scene.clear();
      }

      console.log('City has been shut down');
    }
  }

  /**
   * Updates the info panel with the information in the object
   * @param {SimObject} object
   */
  updateInfoPanel(object) {
    const infoElement = document.getElementById('info-panel')
    if (object) {
      infoElement.style.visibility = 'visible';
      infoElement.innerHTML = object.toHTML();
    } else {
      infoElement.style.visibility = 'hidden';
      infoElement.innerHTML = '';
    }
  }

  /**
   * Updates the citizen stats panel
   * @param {Game} game
   */
  updateCitizenStats(game) {
    const statsElement = document.getElementById('citizen-stats-content');
    if (!statsElement || !game.city) return;

    // Gather citizen statistics
    const stats = this.#gatherCitizenStats(game.city);

    // Format stats display
    const html = `
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 5px; margin-bottom: 5px;">
        <span>Total Citizens:</span>
        <span style="text-align: right; font-weight: bold;">${stats.total}</span>

        <span>👔 Employed:</span>
        <span style="text-align: right; color: #4CAF50;">${stats.employed} (${stats.employmentRate}%)</span>

        <span>🔍 Unemployed:</span>
        <span style="text-align: right; color: #FFC107;">${stats.unemployed}</span>

        <span>📚 Students:</span>
        <span style="text-align: right; color: #2196F3;">${stats.students}</span>

        <span>🏖️ Retired:</span>
        <span style="text-align: right; color: #9E9E9E;">${stats.retired}</span>
      </div>
      <div style="border-top: 1px solid #444; padding-top: 5px; margin-top: 5px;">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 5px;">
          <span>😊 Avg Happiness:</span>
          <span style="text-align: right; color: ${stats.happinessColor};">${stats.avgHappiness}/100</span>

          <span>🏥 Avg Health:</span>
          <span style="text-align: right; color: ${stats.healthColor};">${stats.avgHealth}/100</span>
        </div>
      </div>
    `;

    statsElement.innerHTML = html;
  }

  /**
   * Gather statistics about all citizens in the city
   * @param {City} city
   * @returns {object} Statistics object
   */
  #gatherCitizenStats(city) {
    const stats = {
      total: 0,
      employed: 0,
      unemployed: 0,
      students: 0,
      retired: 0,
      totalHappiness: 0,
      totalHealth: 0,
      employmentRate: 0,
      avgHappiness: 0,
      avgHealth: 0,
      happinessColor: '#ffffff',
      healthColor: '#ffffff'
    };

    // Iterate through all residential buildings
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile.building?.type === 'residential' && tile.building.residents) {
          const residents = tile.building.residents.getResidents?.();
          if (residents) {
            for (const citizen of residents) {
              stats.total++;

              // Count by state
              switch (citizen.state) {
                case 'employed':
                  stats.employed++;
                  break;
                case 'unemployed':
                  stats.unemployed++;
                  break;
                case 'school':
                  stats.students++;
                  break;
                case 'retired':
                  stats.retired++;
                  break;
              }

              // Sum happiness and health
              stats.totalHappiness += citizen.needs.happiness;
              stats.totalHealth += citizen.needs.health;
            }
          }
        }
      }
    }

    // Calculate averages
    if (stats.total > 0) {
      stats.avgHappiness = Math.floor(stats.totalHappiness / stats.total);
      stats.avgHealth = Math.floor(stats.totalHealth / stats.total);

      // Calculate employment rate (excluding students and retired)
      const workingAge = stats.employed + stats.unemployed;
      if (workingAge > 0) {
        stats.employmentRate = Math.floor((stats.employed / workingAge) * 100);
      }

      // Color code happiness
      stats.happinessColor = stats.avgHappiness >= 67 ? '#4CAF50' :
                             stats.avgHappiness >= 34 ? '#FFC107' : '#FF5252';

      // Color code health
      stats.healthColor = stats.avgHealth >= 67 ? '#4CAF50' :
                          stats.avgHealth >= 34 ? '#FFC107' : '#FF5252';
    }

    return stats;
  }

  /**
   * Show follow indicator for a citizen
   * @param {THREE.Object3D} target
   */
  showFollowIndicator(target) {
    const indicator = document.getElementById('follow-indicator');
    const nameElement = document.getElementById('follow-citizen-name');

    if (indicator && nameElement && target.userData.citizen) {
      const citizen = target.userData.citizen;
      nameElement.innerHTML = `${citizen.name}<br><small>${citizen.currentActivity.replace(/_/g, ' ')}</small>`;
      indicator.style.display = 'block';
    }
  }

  /**
   * Hide follow indicator
   */
  hideFollowIndicator() {
    const indicator = document.getElementById('follow-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
}

window.ui = new GameUI();