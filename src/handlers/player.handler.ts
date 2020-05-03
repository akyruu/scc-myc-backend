import {PlayerProps, SocketError, Vehicle} from '../models';
import {AppSocket} from '../sockets';
import {RushUtils, SettingsUtils} from '../utils';
import {SocketHandler} from './socket.handler';

/**
 * Handler for player operations in lobby.
 *
 * @version 0.1.0
 */
export class PlayerHandler implements SocketHandler {
  /* METHODS ============================================================== */
  bindEvents(socket: AppSocket): void {
    socket.bindEvent('lobby:player:updateProps', this._updatePlayerProps.bind(this));
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

    socket.all('lobby:player:propsUpdated', data);
  }
}
