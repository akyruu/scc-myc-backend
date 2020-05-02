import {Socket} from 'socket.io';
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

  static groupPropsUpdated(socket: AppSocket, groupIndex: number, updatedProps: GroupProps): void {
    const data = {groupIndex: groupIndex, updatedProps: updatedProps};
    socket.io.emit('lobby:group:propsUpdated', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:propsUpdated', data);
  }

  static groupRemoved(socket: AppSocket, groupIndex: number): void {
    socket.io.emit('lobby:group:removed', groupIndex);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:removed', groupIndex);
  }

  /* Player -------------------------------------------------------------- */
  static playerAdded(socket: AppSocket, playerName: string, groupIndex: number): void {
    const data = {playerName: playerName, groupIndex: groupIndex};
    socket.io.emit('lobby:group:playerAdded', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:playerAdded', data);
  }

  static playerSwitched(socket: AppSocket, playerName: string, oldGroupIndex: number, newGroupIndex: number): void {
    const data = {playerName: playerName, oldGroupIndex: oldGroupIndex, newGroupIndex: newGroupIndex};
    socket.io.emit('lobby:group:playerSwitched', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:playerSwitched', data);
  }

  static playerRemoved(socket: AppSocket, playerName: string, groupIndex: number): void {
    const data = {playerName: playerName, groupIndex: groupIndex};
    socket.io.emit('lobby:group:playerRemoved', data);
    socket.io.in(socket.rush.uuid).broadcast.emit('lobby:group:playerRemoved', data);
  }

  /* Errors -------------------------------------------------------------- */
  static groupAlreadyExists(socket: Socket, groupName: string): void {
    ErrorEmitter.exception(socket, 'lobby:group:alreadyExists', {groupName: groupName});
  }

  static groupNotFound(socket: AppSocket, groupIndex: number) {
    ErrorEmitter.exception(socket.io, 'lobby:group:notFound', {groupIndex: groupIndex});
  }

  static playerNotFound(socket: AppSocket, playerName: string, groupIndex: number) {
    ErrorEmitter.exception(socket.io, 'lobby:group:playerNotFound', {playerName: playerName, groupIndex: groupIndex});
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}
