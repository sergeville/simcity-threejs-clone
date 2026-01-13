import * as THREE from 'three';
import { AssetManager } from './assets/assetManager.js';
import { CameraManager } from './camera.js';
import { InputManager } from './input.js';
import { City } from './sim/city.js';
import { SimObject } from './sim/simObject.js';
import { AIAgent } from './ai/aiAgent.js';
import { SaveManager } from './saveManager.js';

/** 
 * Manager for the Three.js scene. Handles rendering of a `City` object
 */
export class Game {
  /**
   * @type {City}
   */
  city;
  /**
   * Object that currently hs focus
   * @type {SimObject | null}
   */
  focusedObject = null;
  /**
   * Class for managing user input
   * @type {InputManager}
   */
  inputManager;
  /**
   * Object that is currently selected
   * @type {SimObject | null}
   */
  selectedObject = null;
  /**
   * AI agent that can play the game autonomously
   * @type {AIAgent}
   */
  aiAgent = new AIAgent();

  constructor(city) {
    this.city = city;

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    this.scene = new THREE.Scene();

    this.inputManager = new InputManager(window.ui.gameWindow);
    this.cameraManager = new CameraManager(window.ui.gameWindow);

    // Configure the renderer
    this.renderer.setSize(window.ui.gameWindow.clientWidth, window.ui.gameWindow.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Add the renderer to the DOM
    window.ui.gameWindow.appendChild(this.renderer.domElement);

    // Variables for object selection
    this.raycaster = new THREE.Raycaster();

    /**
     * Global instance of the asset manager
     */
    window.assetManager = new AssetManager(() => {
      window.ui.hideLoadingText();

      // Try to load saved game
      const saveData = SaveManager.load();

      if (saveData) {
        try {
          console.log('Loading saved game...');
          this.city = City.deserialize(saveData);

          if (window.activityFeed) {
            window.activityFeed.info('Game loaded successfully!', '💾');
            window.activityFeed.info(`Welcome back, Mayor! City: ${this.city.name}`, '🏙️');
          }
        } catch (error) {
          console.error('Failed to load saved game:', error);
          this.city = new City(128); // Fallback to new city

          if (window.activityFeed) {
            window.activityFeed.info('Could not load saved game. Starting new city...', '⚠️');
          }
        }
      } else {
        this.city = new City(128); // 128x128 MASSIVE map - 16,384 tiles!

        // Welcome message to activity feed
        if (window.activityFeed) {
          window.activityFeed.info('Welcome, Mayor! Your city awaits.', '🏙️');
          window.activityFeed.info(`Map generated: ${this.city.size}x${this.city.size} (${this.city.size * this.city.size} tiles)`, '🗺️');
        }
      }

      this.initialize(this.city);
      this.start();

      // Setup auto-save triggers
      this.#setupAutoSave();

      setInterval(this.simulate.bind(this), 1000);
    });

    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  /**
   * Initalizes the scene, clearing all existing assets
   */
  initialize(city) {
    this.scene.clear();
    this.scene.add(city);
    this.#setupLights();
    this.#setupGrid(city);
  }

  #setupGrid(city) {
    // Add the grid
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      map: window.assetManager.textures['grid'],
      transparent: true,
      opacity: 0.2
    });
    gridMaterial.map.repeat = new THREE.Vector2(city.size, city.size);
    gridMaterial.map.wrapS = city.size;
    gridMaterial.map.wrapT = city.size;

    const grid = new THREE.Mesh(
      new THREE.BoxGeometry(city.size, 0.1, city.size),
      gridMaterial
    );
    grid.position.set(city.size / 2 - 0.5, -0.04, city.size / 2 - 0.5);
    this.scene.add(grid);
  }

  /**
   * Setup the lights for the scene
   */
  #setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 2)
    sun.position.set(-10, 20, 0);
    sun.castShadow = true;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 50;
    sun.shadow.normalBias = 0.01;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }
  
  /**
   * Starts the renderer
   */
  start() {
    this.renderer.setAnimationLoop(this.draw.bind(this));
  }

  /**
   * Stops the renderer
   */
  stop() {
    this.renderer.setAnimationLoop(null);
  }

  /**
   * Render the contents of the scene
   */
  draw() {
    this.city.draw();
    this.updateFocusedObject();

    if (this.inputManager.isLeftMouseDown) {
      this.useTool();
    }

    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  /**
   * Moves the simulation forward by one step
   */
  simulate() {
    if (window.ui.isPaused) return;

    // AI agent makes decisions before city simulation
    this.aiAgent.simulate(this.city);

    // Update the city data model first, then update the scene
    this.city.simulate(1);

    window.ui.updateTitleBar(this);
    window.ui.updateCitizenStats(this);
    window.ui.updateInfoPanel(this.selectedObject);
  }

  /**
   * Uses the currently active tool
   */
  useTool() {
    switch (window.ui.activeToolId) {
      case 'select':
        this.updateSelectedObject();
        window.ui.updateInfoPanel(this.selectedObject);
        break;
      case 'bulldoze':
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.bulldoze(x, y);
        }
        break;
      default:
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.placeBuilding(x, y, window.ui.activeToolId);
        }
        break;
    }
  }
  
  /**
   * Sets the currently selected object and highlights it
   */
  updateSelectedObject() {
    this.selectedObject?.setSelected(false);
    this.selectedObject = this.focusedObject;
    this.selectedObject?.setSelected(true);

    // Check if we clicked on a citizen
    const clickedMesh = this.#raycast();
    if (clickedMesh && clickedMesh.type === 'citizen') {
      // Get the actual mesh from the scene
      const mesh = this.#findCitizenMesh(clickedMesh.citizen);
      if (mesh) {
        this.cameraManager.followObject(mesh);
      }
    } else {
      // Clicked on something else, stop following
      if (this.cameraManager.followTarget) {
        this.cameraManager.stopFollowing();
      }
    }
  }

  /**
   * Find the mesh for a citizen in the scene
   * @param {Citizen} citizen
   * @returns {THREE.Mesh | null}
   */
  #findCitizenMesh(citizen) {
    // Find citizen manager service
    const citizenManager = this.city.services.find(s => s.constructor.name === 'CitizenManager');
    if (citizenManager && citizenManager.citizenMeshes) {
      return citizenManager.citizenMeshes.get(citizen.id);
    }
    return null;
  }

  /**
   * Sets the object that is currently highlighted
   */
  updateFocusedObject() {  
    this.focusedObject?.setFocused(false);
    const newObject = this.#raycast();
    if (newObject !== this.focusedObject) {
      this.focusedObject = newObject;
    }
    this.focusedObject?.setFocused(true);
  }

  /**
   * Gets the mesh currently under the the mouse cursor. If there is nothing under
   * the the mouse cursor, returns null
   * @param {MouseEvent} event Mouse event
   * @returns {THREE.Mesh | null}
   */
  #raycast() {
    var coords = {
      x: (this.inputManager.mouse.x / this.renderer.domElement.clientWidth) * 2 - 1,
      y: -(this.inputManager.mouse.y / this.renderer.domElement.clientHeight) * 2 + 1
    };

    this.raycaster.setFromCamera(coords, this.cameraManager.camera);

    let intersections = this.raycaster.intersectObjects(this.city.root.children, true);
    if (intersections.length > 0) {
      // The SimObject attached to the mesh is stored in the user data
      const selectedObject = intersections[0].object.userData;
      return selectedObject;
    } else {
      return null;
    }
  }

  /**
   * Resizes the renderer to fit the current game window
   */
  onResize() {
    this.cameraManager.resize(window.ui.gameWindow);
    this.renderer.setSize(window.ui.gameWindow.clientWidth, window.ui.gameWindow.clientHeight);
  }

  /**
   * Save the current game state to localStorage
   */
  saveGame() {
    if (!this.city) {
      console.warn('Cannot save: No city loaded');
      return false;
    }

    const success = SaveManager.save(this.city);

    if (success && window.activityFeed) {
      window.activityFeed.info('Game saved', '💾');
    }

    return success;
  }

  /**
   * Setup auto-save triggers
   */
  #setupAutoSave() {
    // Save before window closes
    window.addEventListener('beforeunload', () => {
      console.log('Auto-saving before exit...');
      this.saveGame();
    });

    // Periodic auto-save every 60 seconds (if not paused)
    setInterval(() => {
      if (!window.ui.isPaused && this.city) {
        console.log('Auto-saving...');
        this.saveGame();
      }
    }, 60000);
  }
}

// Create a new game when the window is loaded
window.onload = () => {
  window.game = new Game();
}