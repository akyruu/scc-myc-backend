import {Socket} from 'socket.io';

import {Room} from '../models';

export class AppSocket {
    /* FIELDS ============================================================== */
    public player: string;
    public room: Room;

    /* METHODS ============================================================= */
    constructor(public io: Socket) {}
}