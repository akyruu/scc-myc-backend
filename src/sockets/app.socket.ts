import {Socket} from 'socket.io';

import {Player, Rush, SocketContext, SocketError, SocketFailed, SocketResult, SocketSuccess} from '../models';

export class AppSocket implements SocketContext {
  /* FIELDS ================================================================ */
  player: Player;
  rush: Rush;

  /* CONSTRUCTOR =========================================================== */
  constructor(private _io: Socket) {}

  /* METHODS =============================================================== */
  bindEvent<T, U>(event: string, listener: (socket: AppSocket, data?: T) => U): void {
    this._io.on(event, (data?: T) => {
      let result: SocketResult<U>;
      try {
        const payload = listener(this, data);
        result = new SocketSuccess(payload);
      } catch (err) {
        if (!(err instanceof SocketError)) {
          err = new SocketError('unknown', err);
        }
        result = new SocketFailed(err);
      }
      this._io.emit(event + '_result', result);
    });
  }

  /* Actions --------------------------------------------------------------- */
  all(event: string, data?: any): void {
    this.emit(event, data);
    this.broadcast(event, data);
  }

  broadcast(event: string, data?: any): void {
    if (!this.rush) {
      throw new SocketError('rushNotFound');
    }
    this._io.in(this.rush.uuid).broadcast.emit(event, data);
  }

  emit(event: string, data?: any): void {
    this._io.emit(event, data);
  }

  join(player: Player, rush: Rush): void {
    this._io.join(rush.uuid);

    this.player = player;
    this.rush = rush;
  }

  leave() {
    this._io.leave(this.rush.uuid);

    this.player = null;
    this.rush = null;
  }
}
