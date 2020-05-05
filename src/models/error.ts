import {SocketError} from './socket';

export function groupAlreadyExists(groupName: string) {
  return new SocketError('groupAlreadyExists', {groupName: groupName});
}

export function groupNotFound(groupIndex: number) {
  return new SocketError('groupNotFound', {groupIndex: groupIndex});
}

export function playerNotFound(playerName: string) {
  new SocketError('playerNotFound', {playerName: playerName});
}

export function rushNotFoundError(rushUuid: string) {
  return new SocketError('rushNotFound', {rushUuid: rushUuid});
}

export function vehicleNotFound(vehicleName: string) {
  return new SocketError('vehicleNotFound', {vehicleName: vehicleName});
}
