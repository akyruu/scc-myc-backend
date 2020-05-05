// Shared
import {Box, BoxItem, Item, ItemType, Player, Settings} from '../../models';

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

  /* Box item -------------------------------------------------------------- */
  static createBoxItem(type: ItemType, item: Item): BoxItem {
    const boxItem = new BoxItem();
    boxItem.type = type;
    boxItem.item = item;
    return boxItem;
  }

  static findBoxItem(box: Box, itemName: string): BoxItem {
    return box.items.find(boxItem => boxItem.item.name === itemName);
  }

  static updateBoxItem(boxItem: BoxItem): void {
    boxItem.calculated.value = (boxItem.quantity || 0) * boxItem.item.price;
  }

  /* Rucksack -------------------------------------------------------------- */
  static rucksackAddBoxItem(player: Player, boxItem: BoxItem): void {
    if (!player.rucksack) {
      const rucksack = new Box();
      rucksack.index = player.boxes.length + 1;
      player.rucksack = rucksack;
    }
    player.rucksack.items.push(boxItem);
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}
