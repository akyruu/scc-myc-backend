import {LobbyPlayerEmitter, LobbyRushEmitter} from '../emitters';
import {GroupProps, PlayerProps, Vehicle} from '../models';
import {AppSocket} from '../sockets';
import {RushUtils, SettingsUtils} from '../utils';
import {SocketHandler} from './socket.handler';

/**
 * Handler for player operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyPlayerHandler implements SocketHandler {
  /* METHODS ============================================================== */
  bindEvents(socket: AppSocket): void {
    socket.io.on('lobby:player:updateProps', (data: { playerName: string, updatedProps: PlayerProps }) =>
        this._updatePlayerProps(socket, data.playerName, data.updatedProps));
  }

  /**
   * Update the properties of player.
   *
   * @param socket Current socket.
   * @param playerName Name of player to update.
   * @param updatedProps Updated properties of player.
   * @private
   */
  private _updatePlayerProps(socket: AppSocket, playerName: string, updatedProps: GroupProps) {
    const player = RushUtils.findPlayerDeep(socket.rush, playerName);
    if (!player) {
      LobbyRushEmitter.playerNotFound(socket.io, playerName, socket.rush.uuid);
      return;
    }

    if (updatedProps.vehicleName !== undefined) {
      let vehicle: Vehicle;
      if (updatedProps.vehicleName) {
        vehicle = SettingsUtils.findVehicle(socket.rush.settings, updatedProps.vehicleName);
        if (!vehicle) {
          LobbyRushEmitter.vehicleNotFound(socket.io, updatedProps.vehicleName);
          return;
        }
      }
      player.vehicle = vehicle;
    }

    LobbyPlayerEmitter.playerPropsUpdated(socket, playerName, updatedProps);
  }
}