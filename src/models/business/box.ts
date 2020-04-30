// Shared
import {BoxItem} from './box-item';

export class Box {
  index: number;
  maxQuantity: number;
  items: BoxItem[] = [];

  readonly calculated = {
    quantity: 0,
    value: 0
  };
}
