import { BuildingType } from './buildingType.js';
import { CommercialZone } from './zones/commercial.js';
import { ResidentialZone } from './zones/residential.js';
import { IndustrialZone } from './zones/industrial.js';
import { Road } from './transportation/road.js';
import { Building } from './building.js';
import { PowerPlant } from './power/powerPlant.js';
import { PowerLine } from './power/powerLine.js';
import { Hospital } from './services/hospital.js';
import { PoliceStation } from './services/policeStation.js';
import { FireStation } from './services/fireStation.js';
import { School } from './services/school.js';

/**
 * Creates a new building object
 * @param {number} x The x-coordinate of the building
 * @param {number} y The y-coordinate of the building
 * @param {string} type The building type
 * @returns {Building} A new building object
 */
export function createBuilding(x, y, type) {
  switch (type) {
    case BuildingType.residential:
      return new ResidentialZone();
    case BuildingType.commercial:
      return new CommercialZone();
    case BuildingType.industrial:
      return new IndustrialZone();
    case BuildingType.road:
      return new Road();
    case BuildingType.powerPlant:
      return new PowerPlant();
    case BuildingType.powerLine:
      return new PowerLine();
    case BuildingType.hospital:
      return new Hospital(x, y);
    case BuildingType.policeStation:
      return new PoliceStation(x, y);
    case BuildingType.fireStation:
      return new FireStation(x, y);
    case BuildingType.school:
      return new School(x, y);
    default:
      console.error(`${type} is not a recognized building type.`);
  }
}