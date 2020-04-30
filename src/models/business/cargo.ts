// Shared
import {Fragment} from './fragment';
import {Vehicle} from './vehicle';

export class Cargo {
  index: number;
  vehicle: Vehicle;

  fragment: Fragment;
  fragments: Fragment[] = [];

  readonly calculated = {
    mass: 0,
    quantity: 0,
    percent: 0,
    value: 0
  };
}
