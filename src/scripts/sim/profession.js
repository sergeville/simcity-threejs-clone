/**
 * Represents a profession/job type in the city
 */
export class Profession {
  /**
   * @param {string} name - Name of the profession
   * @param {string} category - Industry category
   * @param {number} educationRequired - Education level needed (0-100)
   * @param {number} baseSalary - Monthly salary
   * @param {string} buildingType - Type of building where this job exists
   */
  constructor(name, category, educationRequired, baseSalary, buildingType) {
    this.name = name;
    this.category = category;
    this.educationRequired = educationRequired;
    this.baseSalary = baseSalary;
    this.buildingType = buildingType;
  }

  /**
   * Check if a citizen is qualified for this profession
   * @param {Citizen} citizen
   * @returns {boolean}
   */
  isQualified(citizen) {
    return citizen.needs.education >= this.educationRequired &&
           citizen.age >= 18 &&
           citizen.age < 65;
  }
}

/**
 * All available professions in the game
 */
export const Professions = {
  // 🏛️ PUBLIC SERVICE, LAW & SAFETY

  // Law Enforcement (Police Station)
  policeOfficer: new Profession('Police Officer', 'Law Enforcement', 40, 4500, 'police-station'),
  detective: new Profession('Detective', 'Law Enforcement', 60, 6500, 'police-station'),
  sheriff: new Profession('Sheriff', 'Law Enforcement', 50, 5500, 'police-station'),

  // Legal (Court House)
  lawyer: new Profession('Lawyer', 'Legal', 90, 12000, 'courthouse'),
  judge: new Profession('Judge', 'Legal', 95, 15000, 'courthouse'),
  paralegal: new Profession('Paralegal', 'Legal', 65, 5000, 'courthouse'),

  // Emergency Services (Fire Station, Hospital)
  firefighter: new Profession('Firefighter', 'Emergency', 35, 5000, 'fire-station'),
  paramedic: new Profession('Paramedic', 'Emergency', 70, 5500, 'hospital'),
  emergencyDispatcher: new Profession('Emergency Dispatcher', 'Emergency', 30, 3800, 'fire-station'),

  // Government (City Hall)
  urbanPlanner: new Profession('Urban Planner', 'Government', 85, 7500, 'city-hall'),
  policyAnalyst: new Profession('Policy Analyst', 'Government', 80, 7000, 'city-hall'),
  socialWorker: new Profession('Social Worker', 'Government', 75, 5000, 'city-hall'),

  // 🩺 HEALTHCARE & MEDICAL

  // Practitioners (Hospital)
  doctor: new Profession('Doctor', 'Healthcare', 95, 18000, 'hospital'),
  surgeon: new Profession('Surgeon', 'Healthcare', 98, 25000, 'hospital'),
  nurse: new Profession('Nurse', 'Healthcare', 65, 6500, 'hospital'),
  dentist: new Profession('Dentist', 'Healthcare', 90, 15000, 'dental-clinic'),
  pharmacist: new Profession('Pharmacist', 'Healthcare', 85, 11000, 'pharmacy'),

  // Therapy & Wellness
  physiotherapist: new Profession('Physiotherapist', 'Healthcare', 80, 7500, 'clinic'),
  psychologist: new Profession('Psychologist', 'Healthcare', 90, 9000, 'clinic'),
  nutritionist: new Profession('Nutritionist', 'Healthcare', 75, 6000, 'clinic'),

  // Medical Labs
  clinicalLabTech: new Profession('Clinical Lab Technician', 'Medical Lab', 70, 5500, 'medical-lab'),
  pathologist: new Profession('Pathologist', 'Medical Lab', 95, 16000, 'medical-lab'),
  microbiologist: new Profession('Microbiologist', 'Medical Lab', 85, 8500, 'medical-lab'),
  radiologist: new Profession('Radiologist', 'Medical Lab', 90, 20000, 'hospital'),

  // 🏗️ CONSTRUCTION, TRADES & INDUSTRIAL

  // Trades (Construction Site, Industrial)
  carpenter: new Profession('Carpenter', 'Trades', 25, 4500, 'industrial'),
  electrician: new Profession('Electrician', 'Trades', 35, 5500, 'industrial'),
  plumber: new Profession('Plumber', 'Trades', 30, 5000, 'industrial'),
  welder: new Profession('Welder', 'Trades', 35, 4800, 'industrial'),
  mason: new Profession('Mason', 'Trades', 20, 4200, 'industrial'),

  // Engineering
  civilEngineer: new Profession('Civil Engineer', 'Engineering', 85, 9500, 'office'),
  architect: new Profession('Architect', 'Engineering', 90, 11000, 'office'),
  surveyor: new Profession('Surveyor', 'Engineering', 60, 6500, 'office'),

  // Industrial Labs
  metallurgist: new Profession('Metallurgist', 'Industrial Lab', 80, 8000, 'research-lab'),
  materialsEngineer: new Profession('Materials Engineer', 'Industrial Lab', 85, 8500, 'research-lab'),
  calibrationTech: new Profession('Calibration Technician', 'Industrial Lab', 55, 5000, 'research-lab'),

  // 💻 TECHNOLOGY & RESEARCH

  // IT & Tech (Office, Tech Company)
  softwareDeveloper: new Profession('Software Developer', 'Technology', 75, 10000, 'tech-office'),
  dataScientist: new Profession('Data Scientist', 'Technology', 85, 12000, 'tech-office'),
  cyberSecurityAnalyst: new Profession('Cybersecurity Analyst', 'Technology', 80, 11000, 'tech-office'),
  uxDesigner: new Profession('UX Designer', 'Technology', 70, 8500, 'tech-office'),
  aiEngineer: new Profession('AI Engineer', 'Technology', 90, 15000, 'tech-office'),

  // Science (Research Lab, University)
  biologist: new Profession('Biologist', 'Science', 85, 7500, 'research-lab'),
  chemist: new Profession('Chemist', 'Science', 85, 8000, 'research-lab'),
  physicist: new Profession('Physicist', 'Science', 90, 9500, 'research-lab'),
  astronomer: new Profession('Astronomer', 'Science', 90, 9000, 'observatory'),
  geologist: new Profession('Geologist', 'Science', 80, 7500, 'research-lab'),

  // Research Labs
  researchScientist: new Profession('Research Scientist', 'R&D', 90, 11000, 'research-lab'),
  labTechnician: new Profession('Lab Technician', 'R&D', 60, 5500, 'research-lab'),
  cleanroomTech: new Profession('Cleanroom Technician', 'R&D', 65, 6500, 'tech-factory'),

  // 💰 BUSINESS, FINANCE & BANKING

  // Finance (Bank, Office)
  banker: new Profession('Banker', 'Finance', 75, 8500, 'bank'),
  accountant: new Profession('Accountant', 'Finance', 70, 7000, 'office'),
  stockbroker: new Profession('Stockbroker', 'Finance', 80, 12000, 'bank'),
  financialAdvisor: new Profession('Financial Advisor', 'Finance', 75, 9000, 'bank'),
  auditor: new Profession('Auditor', 'Finance', 75, 8000, 'office'),

  // Management (Office, Commercial)
  ceo: new Profession('CEO', 'Management', 95, 30000, 'office'),
  hrManager: new Profession('HR Manager', 'Management', 70, 7500, 'office'),
  marketingDirector: new Profession('Marketing Director', 'Management', 80, 10000, 'office'),
  projectManager: new Profession('Project Manager', 'Management', 75, 9000, 'office'),
  prSpecialist: new Profession('PR Specialist', 'Management', 65, 6500, 'office'),

  // Real Estate
  realEstateAgent: new Profession('Real Estate Agent', 'Real Estate', 50, 7000, 'commercial'),
  propertyManager: new Profession('Property Manager', 'Real Estate', 60, 6000, 'commercial'),

  // 🎨 CREATIVE & SERVICE

  // Arts (Gallery, Studio, Commercial)
  artist: new Profession('Artist', 'Arts', 40, 4000, 'commercial'),
  musician: new Profession('Musician', 'Arts', 35, 3500, 'commercial'),
  graphicDesigner: new Profession('Graphic Designer', 'Arts', 60, 6000, 'office'),
  photographer: new Profession('Photographer', 'Arts', 40, 5000, 'commercial'),

  // Food & Hospitality (Restaurant, Hotel, Commercial)
  chef: new Profession('Chef', 'Food Service', 45, 5500, 'commercial'),
  barista: new Profession('Barista', 'Food Service', 10, 2500, 'commercial'),
  hotelManager: new Profession('Hotel Manager', 'Hospitality', 65, 7000, 'commercial'),

  // Education (School, University)
  teacher: new Profession('Teacher', 'Education', 80, 5500, 'school'),
  professor: new Profession('Professor', 'Education', 95, 9000, 'university'),
  librarian: new Profession('Librarian', 'Education', 70, 4500, 'school'),

  // 🔬 SPECIALIZED LABS

  // Forensic Lab
  forensicScientist: new Profession('Forensic Scientist', 'Forensics', 85, 8500, 'forensic-lab'),
  ballisticsExpert: new Profession('Ballistics Expert', 'Forensics', 80, 9000, 'forensic-lab'),

  // Environmental Lab
  ecologist: new Profession('Ecologist', 'Environmental', 80, 7000, 'environmental-lab'),
  toxicologist: new Profession('Toxicologist', 'Environmental', 85, 8500, 'environmental-lab'),

  // 🏪 RETAIL & GENERAL LABOR

  // Entry-level jobs (Commercial, Industrial)
  cashier: new Profession('Cashier', 'Retail', 10, 2200, 'commercial'),
  salesAssociate: new Profession('Sales Associate', 'Retail', 15, 2800, 'commercial'),
  warehouseWorker: new Profession('Warehouse Worker', 'Labor', 10, 3000, 'industrial'),
  janitor: new Profession('Janitor', 'Labor', 5, 2400, 'commercial'),
  securityGuard: new Profession('Security Guard', 'Security', 20, 3200, 'commercial'),
};

/**
 * Get professions by category
 * @param {string} category
 * @returns {Profession[]}
 */
export function getProfessionsByCategory(category) {
  return Object.values(Professions).filter(p => p.category === category);
}

/**
 * Get professions available in a building type
 * @param {string} buildingType
 * @returns {Profession[]}
 */
export function getProfessionsByBuilding(buildingType) {
  return Object.values(Professions).filter(p => p.buildingType === buildingType);
}

/**
 * Get professions a citizen qualifies for
 * @param {Citizen} citizen
 * @returns {Profession[]}
 */
export function getQualifiedProfessions(citizen) {
  return Object.values(Professions).filter(p => p.isQualified(citizen));
}

/**
 * Get a random profession for a building type
 * @param {string} buildingType
 * @returns {Profession}
 */
export function getRandomProfessionForBuilding(buildingType) {
  const professions = getProfessionsByBuilding(buildingType);
  if (professions.length === 0) return null;
  return professions[Math.floor(Math.random() * professions.length)];
}
