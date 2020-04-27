import {Group, GroupProps} from '../models';
import {AppSocket} from '../sockets';
import {ErrorEmitter} from './error.emitter';

/**
 * Emitters for group operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyGroupEmitter {
  /* STATIC METHODS ====================================================== */
  static groupCreated(socket: AppSocket, group: Group): void {
    socket.io.emit('lobby:group:created', group);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:created', group);
  }

  static groupPropsUpdated(socket: AppSocket, groupName: string, updatedProps: GroupProps): void {
    const data = {groupName: groupName, updatedProps: updatedProps};
    socket.io.emit('lobby:group:propsUpdated', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:propsUpdated', data);
  }

  static groupRemoved(socket: AppSocket, groupName: string): void {
    socket.io.emit('lobby:group:removed', groupName);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:removed', groupName);
  }

  /* Player -------------------------------------------------------------- */
  static playerAdded(socket: AppSocket, playerName: string, groupName: string): void {
    const data = {playerName: playerName, groupName: groupName};
    socket.io.emit('lobby:group:playerAdded', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:playerAdded', data);
  }

  static playerSwitched(socket: AppSocket, playerName: string, oldGroupName: string, newGroupName: string): void {
    const data = {playerName: playerName, oldGroupName: oldGroupName, newGroupName: newGroupName};
    socket.io.emit('lobby:group:playerSwitched', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:playerSwitched', data);
  }

  static playerRemoved(socket: AppSocket, playerName: string, groupName: string): void {
    const data = {playerName: playerName, groupName: groupName};
    socket.io.emit('lobby:group:playerRemoved', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:playerRemoved', data);
  }

  /* Errors -------------------------------------------------------------- */
  static groupNotFound(socket: AppSocket, groupName: string) {
    ErrorEmitter.exception(socket.io, 'lobby:group:notFound', {groupName: groupName});
  }

  static playerNotFound(socket: AppSocket, playerName: string, groupName: string) {
    ErrorEmitter.exception(socket.io, 'lobby:group:playerNotFound', {playerName: playerName, groupName: groupName});
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}