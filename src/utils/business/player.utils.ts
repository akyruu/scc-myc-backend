// Shared
import {Box, BoxItem, Player, Settings} from '../../models';

export class PlayerUtils {
  /* STATIC METHODS ====================================================== */
  static createBox(player: Player, settings: Settings): Box {
    const rucksack = new Box();
    rucksack.index = player.boxes.length + 1;
    rucksack.maxQuantity = settings.unit.storage.SCU;
    return rucksack;
  }

  static updateBox(box: Box): void {
    let quantity = 0;
    let value = 0;

    box.items.forEach(boxItem => {
      quantity += boxItem.quantity;
      value += boxItem.calculated.value;
    });

    box.calculated.quantity = quantity;
    box.calculated.value = value;
  }

  static updateBoxItem(boxItem: BoxItem): void {
    boxItem.calculated.value = (boxItem.quantity || 0) * boxItem.item.price;
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}
