import {Socket} from 'socket.io';

import {Player, Rush} from '../models';

export class AppSocket {
  /* FIELDS ============================================================== */
  public player: Player;
  public rush: Rush;

  /* METHODS ============================================================= */
  constructor(public io: Socket) {}
}