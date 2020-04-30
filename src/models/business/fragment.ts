// Shared
import {FragmentOre} from './fragment-ore';

export class Fragment {
  index: number;
  mass: number;
  ores: FragmentOre[] = [];
  inertOre: FragmentOre;

  readonly calculated = {
    quantity: 0,
    value: 0
  };
}
