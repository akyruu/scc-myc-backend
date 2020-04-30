// Shared
import {Harvest, Ore, Settings, Vehicle} from '../../models';

export class SettingsUtils {
  /* STATIC METHODS ====================================================== */
  static findHarvest(settings: Settings, harvestName: string): Harvest {
    return settings.harvests.find(harvest => harvest.name === harvestName);
  }

  static findAllOres(settings: Settings, mineableBy: 'player' | 'vehicle', includeInert = true): Ore[] {
    const ores = settings.ores.filter(ore => ore.mineableBy.includes(mineableBy));
    if (!includeInert) {
      const inertOre = this.findInertOre(settings);
      ores.splice(ores.indexOf(inertOre), 1);
    }
    return ores;
  }

  static findOre(settings: Settings, oreName: string): Ore {
    return settings.ores.find(ore => ore.name === oreName);
  }

  static findInertOre(settings: Settings) {
    return this.findOre(settings, 'Inert Material');
  }

  static findVehicle(settings: Settings, vehicleName: string): Vehicle {
    return settings.vehicles.find(vehicle => vehicle.name === vehicleName);
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}
