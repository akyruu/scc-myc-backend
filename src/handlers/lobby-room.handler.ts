import {readFileSync} from 'fs';

import {LobbyRoomEmitter} from '../emitters';
import {Room} from '../models';
import {AppSocket} from '../sockets';
import {RoomUtils, UuidUtils} from '../utils';
import {SocketHandler} from './socket.handler';

/**
 * Handler for room operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyRoomHandler implements SocketHandler {
    /* FIELDS =============================================================== */
    /** All rooms created on server */
    private readonly _rooms = new Map<string, Room>();

    /* METHODS ============================================================== */
    bindEvents(socket: AppSocket): void {
        socket.io.on('lobby:room:create', player => this._createRoom(socket, player))
            .on('lobby:room:join', data => this._joinRoom(socket, data.player, data.roomUuid))
            .on('lobby:room:leave', this.leaveRoom.bind(this, socket));
    }

    /* Room ---------------------------------------------------------------- */
    /**
     * Create a new room and join it.
     * The player is the leader of this room.
     *
     * @param socket Current socket.
     * @param player Player's name (leader).
     * @private
     */
    private _createRoom(socket: AppSocket, player: string): void {
        const roomUuid = UuidUtils.generateUuid(Array.from(this._rooms.keys()));

        const room = new Room();
        room.uuid = roomUuid;
        room.leader = player;
        room.players.push(player);
        room.settings = require('../../data/settings.json');
        this._rooms.set(roomUuid, room);

        socket.io.join(roomUuid);
        socket.player = player;
        socket.room = room;

        LobbyRoomEmitter.roomCreated(socket.io, room);
    }

    /**
     * Join an existing room. The player must be unique.
     *
     * @param socket Current socket.
     * @param player Player's name.
     * @param roomUuid Identifier of room to join.
     * @private
     */
    private _joinRoom(socket: AppSocket, player: string, roomUuid: string): void {
        const room = this._rooms.get(roomUuid);
        if (!room) {
            LobbyRoomEmitter.roomNotFound(socket.io, roomUuid);
        } else if (room.players.includes(player)) {
            LobbyRoomEmitter.playerAlreadyExistsInRoom(socket.io, player, roomUuid);
        }

        socket.io.join(roomUuid);
        socket.player = player;
        socket.room = room;

        room.players.push(player);
        LobbyRoomEmitter.roomJoined(socket.io, player, room);
    }

    /**
     * Leave a joined room if exists.
     *
     * @param socket Current socket.
     */
    leaveRoom(socket: AppSocket): void {
        if (socket.room?.uuid) {
            socket.io.leave(socket.room.uuid);

            RoomUtils.removePlayer(socket.room, socket.player);
            if (RoomUtils.isEmpty(socket.room)) {
                this._rooms.delete(socket.room.uuid);
            }

            LobbyRoomEmitter.roomLeaved(socket);
            delete socket.player;
            delete socket.room;
        }
    }
}