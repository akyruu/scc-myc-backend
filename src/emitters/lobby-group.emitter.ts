import {RoomGroup} from '../models';
import {AppSocket} from '../sockets';
import {ErrorEmitter} from './error.emitter';

/**
 * Emitters for groups operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyGroupEmitter {
    /* STATIC METHODS ====================================================== */
    static groupCreated(socket: AppSocket, group: RoomGroup): void {
        socket.io.emit('lobby:group:created', group);
        socket.io.in(socket.room.uuid).broadcast.emit('lobby:group:created', group);
    }

    static groupPropsUpdated(socket: AppSocket, groupName: string, updatedProps: { name?: string, vehicleName?: string }): void {
        const data = {groupName: groupName, updatedProps: updatedProps};
        socket.io.emit('lobby:group:propsUpdated', data);
        socket.io.in(socket.room.uuid).broadcast.emit('lobby:group:propsUpdated', data);
    }

    static groupRemoved(socket: AppSocket, groupName: string): void {
        socket.io.emit('lobby:group:removed', groupName);
        socket.io.in(socket.room.uuid).broadcast.emit('lobby:group:removed', groupName);
    }

    /* Player -------------------------------------------------------------- */
    static playerAdded(socket: AppSocket, player: string, groupName: string): void {
        const data = {player: player, groupName: groupName};
        socket.io.emit('lobby:group:playerAdded', data);
        socket.io.in(socket.room.uuid).broadcast.emit('lobby:group:playerAdded', data);
    }

    static playerSwitched(socket: AppSocket, player: string, oldGroupName: string, newGroupName: string): void {
        const data = {player: player, oldGroupName: oldGroupName, newGroupName: newGroupName};
        socket.io.emit('lobby:group:playerSwitched', data);
        socket.io.in(socket.room.uuid).broadcast.emit('lobby:group:playerSwitched', data);
    }

    static playerRemoved(socket: AppSocket, player: string, groupName: string): void {
        const data = {player: player, groupName: groupName};
        socket.io.emit('lobby:group:playerRemoved', data);
        socket.io.in(socket.room.uuid).broadcast.emit('lobby:group:playerRemoved', data);
    }

    /* Errors -------------------------------------------------------------- */
    static groupNotFound(socket: AppSocket, groupName: string) {
        ErrorEmitter.exception(socket.io, 'lobby:group:notFound', {groupName: groupName});
    }

    static playerNotFound(socket: AppSocket, player: string, groupName: string) {
        ErrorEmitter.exception(socket.io, 'lobby:group:playerNotFound', {player: player, groupName: groupName});
    }

    /* CONSTRUCTOR ========================================================= */
    private constructor() {}
}