export default {
  economy: {
    // Starting funds for a new city
    startingFunds: 50000,
    // Construction costs for each building type
    buildingCosts: {
      residential: 500,
      commercial: 1000,
      industrial: 1500,
      road: 100,
      'power-plant': 5000,
      'power-line': 50,
      hospital: 8000,
      'police-station': 6000,
      'fire-station': 7000,
      school: 5000,
    },
    // Monthly maintenance costs for each building type
    maintenanceCosts: {
      residential: 2,
      commercial: 5,
      industrial: 8,
      road: 0.5,
      'power-plant': 50,
      'power-line': 2,
      hospital: 75,
      'police-station': 60,
      'fire-station': 70,
      school: 50,
    },
    // Tax rates (collected monthly)
    taxRates: {
      residential: 15,  // per resident per month
      commercial: 35,   // per worker per month
      industrial: 30    // per worker per month
    }
  },
  modules: {
    development: {
      // Number of simulation cycles the road must fail the abandonment
      // criteria before it has a chance of becoming abandoned
      abandonThreshold: 10,
      // Probability of building being abandoned after it has met the
      // abandonment criteria for 'delay' cycles
      abandonChance: 0.25,
      // Number of days it takes to build a building
      constructionTime: 3,
      // Probability of a building leveling up
      levelUpChance: 0.05,
      // Probability of building being re-developed after it is no longer
      // meeting the abandonment criteria
      redevelopChance: 0.25,
    },
    jobs: {
      // Max # of workers at a building
      maxWorkers: 2,
    },
    residents: {
      // Max # of residents in a house
      maxResidents: 2,
      // Chance for a resident to move in
      residentMoveInChance: 0.5,
    },
    roadAccess: {
      // Max distance to search for a road when determining road access
      searchDistance: 3
    },
  },
  citizen: {
     // Minimum working age for a citizen
    minWorkingAge: 16,
     // Age when citizens retire
    retirementAge: 65,
    // Max Manhattan distance a citizen will search for a job
    maxJobSearchDistance: 4
  },
  vehicle: {
    // The distance travelled per millisecond
    speed: 0.0005,
    // The start/end time where the vehicle should fade
    fadeTime: 500,
    // Maximum lifetime of a vehicle (controls max # of vehicles on screen)
    maxLifetime: 10000,
    // How often vehicles are spawned in milliseconds
    spawnInterval: 1000
  },
  news: {
    // How often monthly reports generate (in simulation steps)
    monthlyReportInterval: 30,
    // Maximum stories to keep in memory
    maxStories: 20,
    // Population milestones that trigger stories
    populationMilestones: [100, 250, 500, 1000, 2500, 5000],
    // Budget milestones that trigger stories (in dollars)
    budgetMilestones: [100000, 250000, 500000, 1000000],
    // Probability of generating citizen spotlight on monthly report
    citizenSpotlightChance: 0.5,
    // Minimum steps between service reports
    serviceReportCooldown: 90
  },
}
