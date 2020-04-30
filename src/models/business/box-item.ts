// Shared
import {Harvest} from './harvest';
import {Ore} from './ore';

export class BoxItem {
  item: Harvest | Ore;
  type: 'harvest' | 'ore';
  quantity: number;

  readonly calculated = {
    value: 0
  };
}
