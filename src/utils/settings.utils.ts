import {Settings, Vehicle} from '../models';

export class SettingsUtils {
  /* STATIC METHODS ====================================================== */
  static findVehicle(settings: Settings, vehicleName: string): Vehicle {
    return settings.vehicles.find(vehicle => vehicle.name === vehicleName);
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}
