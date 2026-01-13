import { SimService } from './simService.js';
import { NewsStory } from './newsStory.js';
import config from '../../config.js';

/**
 * News reporter system that generates optimistic news stories about city events
 */
export class NewsService extends SimService {
  constructor() {
    super('news');
    this.stories = [];
    this.stepCounter = 0;
    this.lastMonthlyReportStep = 0;
    this.milestoneTracking = {
      populationMilestones: new Set(),
      budgetMilestones: new Set()
    };
    this.lastServiceReportStep = {};

    // Reporter personas
    this.reporters = {
      economic: { name: 'Sarah Chen', title: 'Economic Correspondent' },
      city: { name: 'Marcus Williams', title: 'City Affairs Reporter' },
      health: { name: 'Dr. Elena Rodriguez', title: 'Health & Safety Correspondent' },
      employment: { name: 'James Park', title: 'Education & Employment Reporter' }
    };
  }

  simulate(city) {
    this.stepCounter++;

    // Generate monthly report every 30 steps
    const interval = config.news.monthlyReportInterval;
    if (this.stepCounter - this.lastMonthlyReportStep >= interval) {
      this.#generateMonthlyReport(city);
      this.lastMonthlyReportStep = this.stepCounter;
    }

    // Check for events
    this.#detectEvents(city);

    // Cleanup old stories (keep max configured number)
    if (this.stories.length > config.news.maxStories) {
      this.stories = this.stories.slice(-config.news.maxStories);
    }
  }

  #generateMonthlyReport(city) {
    // Rotate between different report types
    const reportTypes = ['economic', 'population', 'service'];
    const reportType = reportTypes[Math.floor(this.stepCounter / 30) % reportTypes.length];

    let story;
    switch (reportType) {
      case 'economic':
        story = this.#createEconomicReport(city);
        break;
      case 'population':
        story = this.#createPopulationReport(city);
        break;
      case 'service':
        story = this.#createServiceReport(city);
        break;
    }

    if (story) {
      this.#addStory(story);
    }

    // Occasionally add citizen spotlight
    if (Math.random() < config.news.citizenSpotlightChance) {
      const spotlightStory = this.#createCitizenSpotlight(city);
      if (spotlightStory) {
        this.#addStory(spotlightStory);
      }
    }
  }

  #detectEvents(city) {
    // Check population milestones
    const pop = city.population;
    for (const milestone of config.news.populationMilestones) {
      if (pop >= milestone && !this.milestoneTracking.populationMilestones.has(milestone)) {
        this.#addStory(this.#createPopulationMilestone(milestone));
        this.milestoneTracking.populationMilestones.add(milestone);
      }
    }

    // Check budget milestones
    if (city.economy) {
      const funds = city.economy.funds;
      for (const milestone of config.news.budgetMilestones) {
        if (funds >= milestone && !this.milestoneTracking.budgetMilestones.has(milestone)) {
          this.#addStory(this.#createBudgetMilestone(funds, milestone));
          this.milestoneTracking.budgetMilestones.add(milestone);
        }
      }
    }
  }

  #createEconomicReport(city) {
    if (!city.economy) return null;

    const funds = Math.floor(city.economy.funds);
    const income = Math.floor(city.economy.monthlyIncome);
    const expenses = Math.floor(city.economy.monthlyExpenses);
    const net = income - expenses;

    const reporter = this.reporters.economic;
    const dateString = this.#getDateString();

    let headline, body;

    if (net > 1000) {
      // Positive economic news
      headline = `City Treasury Grows to $${funds.toLocaleString()} as Tax Revenue Surges`;
      body = `The city's financial health continues to strengthen, with budget reserves growing by $${net.toLocaleString()} this month. According to city records, tax revenue from ${city.population} residents exceeded maintenance costs by a comfortable margin. Economic indicators show sustained growth, with analysts projecting continued stability in the coming months.`;
    } else if (net > 0) {
      // Modest growth
      headline = `Balanced Budget Brings Stability to Growing City`;
      body = `City finances remain stable with a modest surplus of $${net.toLocaleString()} this month. Current treasury stands at $${funds.toLocaleString()}, providing a solid foundation for future growth. Economic experts note the importance of maintaining this balance as the city expands its services and infrastructure.`;
    } else if (net > -500) {
      // Minor deficit - constructive
      headline = `City Implements Cost-Management Strategy Amid Budget Adjustments`;
      body = `With monthly revenue at $${income.toLocaleString()} and expenses at $${expenses.toLocaleString()}, city planners are optimizing resource allocation to maintain fiscal health. Current reserves of $${funds.toLocaleString()} provide flexibility as officials explore new revenue opportunities and efficiency improvements.`;
    } else {
      // Larger deficit - still constructive
      headline = `City Seeks Innovative Solutions to Address Budget Challenges`;
      body = `Economic planners are developing creative strategies to balance the city's budget as expenses currently exceed revenue. With ${city.population} residents depending on city services, officials are committed to finding sustainable solutions that maintain quality of life while achieving fiscal stability.`;
    }

    return new NewsStory({
      headline,
      body,
      reporter: reporter.name,
      reporterTitle: reporter.title,
      category: 'economy',
      icon: net > 0 ? '📈' : '💰',
      priority: 2,
      timestamp: this.stepCounter,
      dateString
    });
  }

  #createPopulationReport(city) {
    const pop = city.population;
    const reporter = this.reporters.city;
    const dateString = this.#getDateString();

    let headline, body;

    if (pop === 0) {
      headline = `New City Ready to Welcome First Residents`;
      body = `City infrastructure is in place and ready for growth. With zoning established and services planned, the community is poised to attract its first residents. City officials express optimism about the opportunities ahead for this developing urban center.`;
    } else if (pop < 100) {
      headline = `Small But Growing: Community of ${pop} Builds Foundation`;
      body = `The city's ${pop} residents are pioneering a new community, with each family playing a vital role in establishing the city's character. Local leaders praise the strong sense of community and shared vision for growth. New housing developments stand ready to welcome additional families.`;
    } else if (pop < 500) {
      headline = `Thriving Community Reaches ${pop} Residents`;
      body = `The city continues to attract new residents, with the population now at ${pop}. Community leaders celebrate the diversity and vitality of the growing neighborhood. With expanding services and employment opportunities, the city is becoming an increasingly attractive place to call home.`;
    } else {
      headline = `Vibrant City of ${pop} Residents Flourishes`;
      body = `The city's population of ${pop} residents reflects a thriving, dynamic community. From young families to established professionals, the diverse population contributes to a rich cultural fabric. City planners are working to ensure infrastructure and services keep pace with the community's continued success.`;
    }

    return new NewsStory({
      headline,
      body,
      reporter: reporter.name,
      reporterTitle: reporter.title,
      category: 'citizen',
      icon: '🏙️',
      priority: 2,
      timestamp: this.stepCounter,
      dateString
    });
  }

  #createServiceReport(city) {
    // Find a service building to report on
    const serviceBuildings = [];

    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile.building && tile.building.services) {
          const type = tile.building.type;
          if (['hospital', 'police-station', 'fire-station', 'school'].includes(type)) {
            serviceBuildings.push(tile.building);
          }
        }
      }
    }

    if (serviceBuildings.length === 0) {
      return this.#createNoServicesReport();
    }

    // Pick a random service building
    const building = serviceBuildings[Math.floor(Math.random() * serviceBuildings.length)];
    const service = building.services;
    const type = building.type;

    const reporter = this.reporters.health;
    const dateString = this.#getDateString();

    const utilization = Math.round((service.currentLoad / service.capacity) * 100);
    const effectiveness = Math.round(service.getEffectiveness());

    let headline, body, icon;

    const serviceName = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (utilization > 90) {
      // High utilization - frame as success story with growth need
      headline = `Growing Population Highlights Success of ${serviceName}`;
      body = `The city's ${serviceName.toLowerCase()} is currently serving ${service.currentLoad} residents at ${effectiveness}% effectiveness, demonstrating strong community engagement with health services. With utilization at ${utilization}%, city planners are exploring options to expand capacity to meet the needs of our thriving population.`;
      icon = type === 'hospital' ? '🏥' : type === 'police-station' ? '👮' : type === 'fire-station' ? '🚒' : '🏫';
    } else if (utilization > 60) {
      // Good utilization
      headline = `${serviceName} Serves Community with ${effectiveness}% Effectiveness`;
      body = `Operating at healthy ${utilization}% capacity, the city's ${serviceName.toLowerCase()} is providing excellent service to ${service.currentLoad} residents. Safety officials confirm that current staffing and resources are well-matched to community needs, ensuring quality care for all residents.`;
      icon = type === 'hospital' ? '🏥' : type === 'police-station' ? '👮' : type === 'fire-station' ? '🚒' : '🏫';
    } else {
      // Lower utilization - frame as available capacity
      headline = `${serviceName} Ready to Serve Growing Community`;
      body = `With capacity to serve ${service.capacity} residents and currently supporting ${service.currentLoad}, the city's ${serviceName.toLowerCase()} stands ready to meet increasing demand. Health experts note that this available capacity positions the city well for future population growth.`;
      icon = type === 'hospital' ? '🏥' : type === 'police-station' ? '👮' : type === 'fire-station' ? '🚒' : '🏫';
    }

    return new NewsStory({
      headline,
      body,
      reporter: reporter.name,
      reporterTitle: reporter.title,
      category: 'service',
      icon,
      priority: 2,
      timestamp: this.stepCounter,
      dateString
    });
  }

  #createNoServicesReport() {
    const reporter = this.reporters.city;
    const dateString = this.#getDateString();

    return new NewsStory({
      headline: `City Planning Health and Safety Infrastructure`,
      body: `As the community grows, city officials are prioritizing the development of essential services including healthcare, education, and public safety facilities. Plans are underway to ensure residents have access to comprehensive services as the population expands.`,
      reporter: reporter.name,
      reporterTitle: reporter.title,
      category: 'service',
      icon: '🏗️',
      priority: 1,
      timestamp: this.stepCounter,
      dateString
    });
  }

  #createCitizenSpotlight(city) {
    const citizen = this.#selectSpotlightCitizen(city);
    if (!citizen) return null;

    const reporter = this.reporters.employment;
    const dateString = this.#getDateString();

    let headline, body, icon;

    if (citizen.state === 'employed' && citizen.salary > 3000) {
      // High earner success story
      headline = `${citizen.name}, ${citizen.age}, Thrives as ${citizen.profession}`;
      body = `${citizen.name} represents the success stories being written daily in our growing city. Earning $${citizen.salary.toLocaleString()} monthly as a ${citizen.profession}, ${citizen.name} is one of many residents finding rewarding careers locally. "The opportunities here have exceeded my expectations," says the ${citizen.age}-year-old professional.`;
      icon = '🎉';
    } else if (citizen.state === 'employed') {
      // Standard employment
      headline = `Local Resident ${citizen.name} Celebrates Career as ${citizen.profession}`;
      body = `${citizen.name}, ${citizen.age}, is among the city's employed residents contributing to the local economy. Working as a ${citizen.profession}, ${citizen.name} exemplifies the diverse workforce that makes our community thrive. City employment rates continue to reflect strong job market conditions.`;
      icon = '👤';
    } else if (citizen.state === 'school') {
      // Student
      headline = `Young Resident ${citizen.name} Pursues Education Goals`;
      body = `At ${citizen.age} years old, ${citizen.name} is among the students taking advantage of the city's educational opportunities. Education officials note that investing in young residents like ${citizen.name} builds a foundation for the city's future success and innovation.`;
      icon = '🎓';
    } else {
      // General positive story
      const happiness = citizen.needs?.happiness || 50;
      if (happiness > 60) {
        headline = `Life is Good for ${citizen.name}: Resident Rates City Highly`;
        body = `${citizen.name}, ${citizen.age}, is one of many satisfied residents calling this city home. "There's a real sense of community here," the resident notes. With strong city services and a growing economy, quality of life remains high for residents across all neighborhoods.`;
        icon = '😊';
      } else {
        return null; // Skip unhappy citizens for optimistic tone
      }
    }

    return new NewsStory({
      headline,
      body,
      reporter: reporter.name,
      reporterTitle: reporter.title,
      category: 'citizen',
      icon,
      priority: 1,
      timestamp: this.stepCounter,
      dateString
    });
  }

  #selectSpotlightCitizen(city) {
    const candidates = [];

    // Gather all citizens
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile.building?.residents) {
          const residents = tile.building.residents.getResidents();
          for (const citizen of residents) {
            const score = this.#calculateSpotlightScore(citizen);
            if (score > 30) {
              candidates.push({ citizen, score });
            }
          }
        }
      }
    }

    if (candidates.length === 0) return null;

    // Select randomly from top candidates
    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.slice(0, Math.min(10, candidates.length));
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    return selected?.citizen;
  }

  #calculateSpotlightScore(citizen) {
    let score = 0;

    // Happiness (0-100 scale, target > 60)
    const happiness = citizen.needs?.happiness || 0;
    score += happiness;

    // Employment status
    if (citizen.state === 'employed') {
      score += 30;
      // Salary bonus
      if (citizen.salary > 5000) score += 20;
      else if (citizen.salary > 3000) score += 10;
    } else if (citizen.state === 'school') {
      score += 20;
    }

    // Age diversity
    if (citizen.age > 50) score += 10; // Long-term residents
    if (citizen.age < 30) score += 5; // Young professionals

    return score;
  }

  #createPopulationMilestone(milestone) {
    const reporter = this.reporters.city;
    const dateString = this.#getDateString();

    const headline = `Population Milestone: City Welcomes ${milestone}th Resident!`;
    const body = `In a major achievement for the growing community, the city's population has reached ${milestone} residents. "This milestone demonstrates the city's appeal as a place to live and work," said community leaders. With strong employment opportunities and quality services, city officials expect continued growth in the coming months.`;

    return new NewsStory({
      headline,
      body,
      reporter: reporter.name,
      reporterTitle: reporter.title,
      category: 'milestone',
      icon: '🏆',
      priority: 5, // Breaking news!
      timestamp: this.stepCounter,
      dateString
    });
  }

  #createBudgetMilestone(funds, milestone) {
    const reporter = this.reporters.economic;
    const dateString = this.#getDateString();

    const headline = `City Treasury Reaches $${milestone.toLocaleString()} Milestone`;
    const body = `The city has achieved a significant financial milestone, with reserves surpassing $${milestone.toLocaleString()}. This strong fiscal position enables the city to invest in infrastructure, expand services, and plan for sustainable long-term growth. Economic analysts praise the balanced approach to revenue and spending that made this achievement possible.`;

    return new NewsStory({
      headline,
      body,
      reporter: reporter.name,
      reporterTitle: reporter.title,
      category: 'milestone',
      icon: '💰',
      priority: 4,
      timestamp: this.stepCounter,
      dateString
    });
  }

  #addStory(story) {
    this.stories.push(story);
    if (window.newsPanel) {
      window.newsPanel.addStory(story);
    }
  }

  #getDateString() {
    // Simple date format - could be enhanced with actual game time
    const step = this.stepCounter;
    const day = Math.floor(step / 30) + 1;
    const hour = Math.floor((step % 30) / 1.25);
    const minute = Math.floor(((step % 30) % 1.25) * 48);

    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `Day ${day}, ${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  getStories() {
    return this.stories;
  }

  serialize() {
    return {
      stories: this.stories.map(s => s.serialize()),
      stepCounter: this.stepCounter,
      lastMonthlyReportStep: this.lastMonthlyReportStep,
      milestoneTracking: {
        populationMilestones: Array.from(this.milestoneTracking.populationMilestones),
        budgetMilestones: Array.from(this.milestoneTracking.budgetMilestones)
      }
    };
  }

  deserialize(data) {
    this.stepCounter = data.stepCounter || 0;
    this.lastMonthlyReportStep = data.lastMonthlyReportStep || 0;
    this.stories = (data.stories || []).map(s => NewsStory.deserialize(s));

    if (data.milestoneTracking) {
      this.milestoneTracking.populationMilestones = new Set(data.milestoneTracking.populationMilestones || []);
      this.milestoneTracking.budgetMilestones = new Set(data.milestoneTracking.budgetMilestones || []);
    }

    // Re-render stories in UI
    if (window.newsPanel) {
      window.newsPanel.render(this.stories);
    }
  }
}
