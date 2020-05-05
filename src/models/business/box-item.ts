// Shared
import {Harvest} from './harvest';
import {Ore} from './ore';

export type Item = Harvest | Ore;
export type ItemType = 'harvest' | 'ore';

export class BoxItem {
  item: Item;
  type: ItemType;
  quantity: number;

  readonly calculated = {
    value: 0
  };
}

export interface BoxItemProps {
  quantity: number;
}
