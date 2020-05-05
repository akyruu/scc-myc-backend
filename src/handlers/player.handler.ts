import {BoxItemProps, ItemType, Player, playerNotFound, PlayerProps, SocketError, Vehicle} from '../models';
import {AppSocket} from '../sockets';
import {PlayerUtils, RushUtils, SettingsUtils} from '../utils';
import {SocketHandler} from './socket.handler';

/**
 * Handler for player operations in lobby.
 *
 * @version 0.1.0
 */
export class PlayerHandler implements SocketHandler {
  /* METHODS ============================================================== */
  bindEvents(socket: AppSocket): void {
    socket.bindEvent('player:updateProps', this._updatePlayerProps.bind(this));
    socket.bindEvent('player:rucksack:addBoxItem', this._rucksackAddBoxItem.bind(this));
    socket.bindEvent('player:rucksack:updateBoxItemProps', this._rucksackUpdateBoxItemProps.bind(this));
    socket.bindEvent('player:rucksack:moveToBox', this._rucksackMoveToBox.bind(this));
  }

  /**
   * Update the properties of player.
   *
   * @param socket Current socket.
   * @param data Player name and properties to update.
   * @private
   */
  private _updatePlayerProps(socket: AppSocket, data: { playerName: string, updatedProps: PlayerProps }): void {
    const playerName = data.playerName;
    const player = RushUtils.findPlayerDeep(socket.rush, playerName);
    if (!player) {
      throw new SocketError('playerNotFound', socket);
    }

    const updatedProps = data.updatedProps;
    if (updatedProps.vehicleName !== undefined) {
      let vehicle: Vehicle;
      if (updatedProps.vehicleName) {
        vehicle = SettingsUtils.findVehicle(socket.rush.settings, updatedProps.vehicleName);
        if (!vehicle) {
          throw new SocketError('vehicleNotFound', {vehicleName: updatedProps.vehicleName});
        }
      }
      player.vehicle = vehicle;
    }

    socket.all('player:propsUpdated', data);
  }

  /* Rucksack -------------------------------------------------------------- */
  /**
   * Add box item in rucksack of player.
   *
   * @param socket Current socket.
   * @param data Name of rucksack owner, type of item and item name.
   */
  private _rucksackAddBoxItem(socket: AppSocket, data: { playerName: string, itemType: ItemType, itemName: string }): void {
    const player = this._findPlayer(socket, data.playerName);
    const item = SettingsUtils.findItem(socket.rush.settings, data.itemName, data.itemType);
    const boxItem = PlayerUtils.createBoxItem(data.itemType, item);
    PlayerUtils.rucksackAddBoxItem(player, boxItem);

    socket.all('player:rucksack:boxItemAdded', {playerName: data.playerName, boxItem: boxItem});
  }

  /**
   * Update box item properties in rucksack of player.
   *
   * @param socket Current socket.
   * @param data Name of rucksack owner, name of item and properties to update.
   */
  private _rucksackUpdateBoxItemProps(socket: AppSocket, data: { playerName: string, itemName: string, updatedProps: BoxItemProps }): void {
    const player = this._findPlayer(socket, data.playerName);
    const boxItem = PlayerUtils.findBoxItem(player.rucksack, data.itemName);

    const updatedProps = data.updatedProps;
    if (updatedProps.quantity) {
      boxItem.quantity = updatedProps.quantity;
      PlayerUtils.updateBoxItem(boxItem);
      PlayerUtils.updateBox(player.rucksack);
    }

    socket.all('player:rucksack:boxItemPropsUpdated', data);
  }

  /**
   * Move rucksack content to a box.
   *
   * @param socket Current socket.
   * @param playerName Name of rucksack owner.
   */
  private _rucksackMoveToBox(socket: AppSocket, playerName: string) {
    const player = this._findPlayer(socket, playerName);
    player.boxes.push(player.rucksack);
    player.rucksack = undefined;

    socket.all('player:rucksack:movedToBox', {playerName: playerName});
  }

  /* Tools ----------------------------------------------------------------- */
  private _findPlayer(socket: AppSocket, playerName: string): Player {
    const player = RushUtils.findPlayerDeep(socket.rush, playerName);
    if (!player) {
      throw playerNotFound(playerName);
    }
    return player;
  }
}
