// Shared
import {Ore} from './ore';

export class FragmentOre {
  ore: Ore;
  percent: number;

  readonly calculated = {
    mass: 0,
    quantity: 0,
    value: 0
  };
}
