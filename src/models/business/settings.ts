// Shared
import {Harvest} from './harvest';
import {Ore} from './ore';
import {Vehicle} from './vehicle';

export class Settings {
  version: string;
  unit: {
    money: string,
    storage: {
      SPU: number,
      SCU: number
    }
  };

  harvests: Harvest[];
  ores: Ore[];
  vehicles: Vehicle[];
}
