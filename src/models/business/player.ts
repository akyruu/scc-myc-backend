// Shared
import {Box} from './box';
import {Cargo} from './cargo';
import {Vehicle} from './vehicle';

export class Player {
  name: string;

  vehicle: Vehicle;
  cargo: Cargo;
  cargos: Cargo[] = [];

  rucksack: Box;
  boxes: Box[] = [];

  ready: boolean;
}

export interface PlayerProps {
  vehicleName?: string;
}
