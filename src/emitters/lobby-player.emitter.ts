import {PlayerProps} from '../models';
import {AppSocket} from '../sockets';

/**
 * Emitters for player operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyPlayerEmitter {
  /* STATIC METHODS ====================================================== */
  static playerPropsUpdated(socket: AppSocket, playerName: string, updatedProps: PlayerProps): void {
    const data = {playerName: playerName, updatedProps: updatedProps};
    socket.io.emit('lobby:player:propsUpdated', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:player:propsUpdated', data);
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}