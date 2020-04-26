import {Socket} from 'socket.io';

import {Room, Vehicle} from '../models';
import {AppSocket} from '../sockets';
import {ErrorEmitter} from './error.emitter';

/**
 * Emitters for rooms operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyRoomEmitter {
    /* STATIC METHODS ====================================================== */
    static roomCreated(socket: Socket, room: Room): void {
        socket.emit('lobby:room:created', room);
    }

    static roomJoined(socket: Socket, player: string, room: Room): void {
        socket.emit('lobby:room:joined', room);
        socket.in(room.uuid).broadcast.emit('lobby:room:playerJoined', player);
    }

    static roomLeaved(socket: AppSocket): void {
        socket.io.emit('lobby:room:leaved');
        socket.io.in(socket.room.uuid).broadcast.emit('lobby:room:playerLeaved', socket.player);
    }

    /* Errors -------------------------------------------------------------- */
    static playerAlreadyExistsInRoom(socket: Socket, player: string, roomUuid: string): void {
        ErrorEmitter.exception(socket, 'lobby:room:playerAlreadyExists', {player: player, roomUuid: roomUuid});
    }

    static playerNotFound(socket: Socket, player: string, roomUuid: string): void {
        ErrorEmitter.exception(socket, 'lobby:room:playerNotFound', {player: player, roomUuid: roomUuid});
    }

    static roomNotFound(socket: Socket, roomUuid: string): void {
        ErrorEmitter.exception(socket, 'lobby:room:notFound', {roomUuid: roomUuid});
    }

    static vehicleNotFound(socket: Socket, vehicleName: string) {
        ErrorEmitter.exception(socket, 'lobby:room:vehicleNotFound', {vehicleName: vehicleName});
    }

    /* CONSTRUCTOR ========================================================= */
    private constructor() {}
}