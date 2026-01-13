import { SimService } from './simService.js';
import config from '../../config.js';

/**
 * Manages the city economy including budget, income, expenses, and tax revenue
 */
export class EconomyService extends SimService {
  /**
   * Current funds available
   * @type {number}
   */
  funds = config.economy.startingFunds;

  /**
   * Total income this month
   * @type {number}
   */
  monthlyIncome = 0;

  /**
   * Total expenses this month
   * @type {number}
   */
  monthlyExpenses = 0;

  /**
   * Track steps for monthly calculations
   * @type {number}
   */
  #stepCounter = 0;

  /**
   * Number of simulation steps per month
   * @type {number}
   */
  #stepsPerMonth = 30;

  /**
   * Is the city in bankruptcy?
   * @type {boolean}
   */
  isBankrupt = false;

  constructor() {
    super();
  }

  /**
   * Simulate one step of the economy
   * @param {City} city
   */
  simulate(city) {
    this.#stepCounter++;

    // Calculate monthly budget at the end of each month
    if (this.#stepCounter >= this.#stepsPerMonth) {
      this.#calculateMonthlyBudget(city);
      this.#stepCounter = 0;
    }

    // Check for bankruptcy
    if (this.funds < 0 && !this.isBankrupt) {
      this.#handleBankruptcy(city);
    }
  }

  /**
   * Calculate monthly income and expenses
   * @param {City} city
   */
  #calculateMonthlyBudget(city) {
    // Reset monthly totals
    this.monthlyIncome = 0;
    this.monthlyExpenses = 0;

    // Calculate tax revenue
    this.monthlyIncome += this.#calculateTaxRevenue(city);

    // Calculate maintenance costs
    this.monthlyExpenses += this.#calculateMaintenanceCosts(city);

    // Apply net budget
    const netRevenue = this.monthlyIncome - this.monthlyExpenses;
    this.funds += netRevenue;
  }

  /**
   * Calculate tax revenue from all buildings
   * @param {City} city
   * @returns {number} Total tax revenue
   */
  #calculateTaxRevenue(city) {
    let totalTax = 0;

    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const building = tile?.building;

        if (!building) continue;

        // Residential tax (per resident)
        if (building.type === 'residential' && building.residents) {
          totalTax += building.residents.count * config.economy.taxRates.residential;
        }

        // Commercial tax (per worker)
        if (building.type === 'commercial' && building.jobs) {
          totalTax += building.jobs.workers.length * config.economy.taxRates.commercial;
        }

        // Industrial tax (per worker)
        if (building.type === 'industrial' && building.jobs) {
          totalTax += building.jobs.workers.length * config.economy.taxRates.industrial;
        }
      }
    }

    return totalTax;
  }

  /**
   * Calculate maintenance costs for all buildings
   * @param {City} city
   * @returns {number} Total maintenance cost
   */
  #calculateMaintenanceCosts(city) {
    let totalCost = 0;

    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const building = tile?.building;

        if (!building) continue;

        // Get maintenance cost for this building type
        const cost = config.economy.maintenanceCosts[building.type] || 0;
        totalCost += cost;
      }
    }

    return totalCost;
  }

  /**
   * Deduct cost for building construction
   * @param {string} buildingType
   * @returns {boolean} True if cost was deducted, false if insufficient funds
   */
  deductConstructionCost(buildingType) {
    const cost = config.economy.buildingCosts[buildingType] || 0;

    if (this.funds >= cost) {
      this.funds -= cost;
      return true;
    }

    return false;
  }

  /**
   * Check if player can afford a building
   * @param {string} buildingType
   * @returns {boolean}
   */
  canAfford(buildingType) {
    const cost = config.economy.buildingCosts[buildingType] || 0;
    return this.funds >= cost;
  }

  /**
   * Get the cost of a building
   * @param {string} buildingType
   * @returns {number}
   */
  getBuildingCost(buildingType) {
    return config.economy.buildingCosts[buildingType] || 0;
  }

  /**
   * Handle bankruptcy conditions
   * @param {City} city
   */
  #handleBankruptcy(city) {
    this.isBankrupt = true;
    console.warn('City is bankrupt! Funds:', this.funds);
    // Future: Trigger bankruptcy event, game over, or loans
  }

  /**
   * Get net revenue (income - expenses)
   * @returns {number}
   */
  get netRevenue() {
    return this.monthlyIncome - this.monthlyExpenses;
  }
}
