import {Socket} from 'socket.io';

import {Player, Rush} from '../models';
import {AppSocket} from '../sockets';
import {ErrorEmitter} from './error.emitter';

/**
 * Emitters for rush operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyRushEmitter {
  /* STATIC METHODS ====================================================== */
  static rushCreated(socket: Socket, player: Player, rush: Rush): void {
    socket.emit('lobby:rush:created', {player: player, rush: rush});
  }

  static rushJoined(socket: Socket, player: Player, rush: Rush): void {
    socket.emit('lobby:rush:joined', {player: player, rush: rush});
    socket.in(rush.uuid).broadcast.emit('lobby:rush:playerJoined', player);
  }

  static rushLaunched(socket: AppSocket): void {
    socket.io.emit('lobby:rush:launched');
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:rush:launched');
  }

  static rushLeaved(socket: AppSocket): void {
    socket.io.emit('lobby:rush:leaved');
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:rush:playerLeaved', socket.player.name);
  }

  /* Errors -------------------------------------------------------------- */
  static playerAlreadyExistsInRush(socket: Socket, playerName: string, rushUuid: string): void {
    ErrorEmitter.exception(socket, 'lobby:rush:playerAlreadyExists', {playerName: playerName, rushUuid: rushUuid});
  }

  static playerNotFound(socket: Socket, playerName: string, rushUuid: string): void {
    ErrorEmitter.exception(socket, 'lobby:rush:playerNotFound', {playerName: playerName, rushUuid: rushUuid});
  }

  static rushAlreadyLaunched(socket: Socket): void {
    ErrorEmitter.exception(socket, 'lobby:rush:alreadyLaunched');
  }

  static rushNotFound(socket: Socket, rushUuid: string): void {
    ErrorEmitter.exception(socket, 'lobby:rush:notFound', {rushUuid: rushUuid});
  }

  static vehicleNotFound(socket: Socket, vehicleName: string) {
    ErrorEmitter.exception(socket, 'lobby:rush:vehicleNotFound', {vehicleName: vehicleName});
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}