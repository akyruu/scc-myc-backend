import {Box} from './box';
import {Cargo} from './cargo';
import {Vehicle} from './vehicle';

export class Session {
  vehicle: Vehicle;
  cargo: Cargo;

  rucksack: Box;
  boxes: Box[] = [];
}
