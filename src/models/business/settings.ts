// TODO shared between frontend and backend
import {Harvest} from './harvest';
import {Ore} from './ore';
import {Vehicle} from './vehicle';

export interface Settings {
  version: string;
  harvests: Harvest[];
  ore: Ore[];
  vehicles: Vehicle[];
}
