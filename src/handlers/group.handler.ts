import {Group, GroupProps, Player, SocketError, Vehicle} from '../models';
import {AppSocket} from '../sockets';
import {GroupUtils, RushUtils, SettingsUtils} from '../utils';
import {SocketHandler} from './socket.handler';

/**
 * Handler for group operations.
 *
 * @version 0.1.0
 */
export class GroupHandler implements SocketHandler {
  /* METHODS ============================================================== */
  bindEvents(socket: AppSocket): void {
    // Group
    socket.bindEvent('lobby:group:create', this._createGroup.bind(this));
    socket.bindEvent('lobby:group:updateProps', this._updateGroupProps.bind(this));
    socket.bindEvent('lobby:group:remove', this._removeGroup.bind(this));

    // Player
    socket.bindEvent('lobby:group:addPlayer', this._addPlayer.bind(this));
    socket.bindEvent('lobby:group:removePlayer', this._removePlayer.bind(this));
    socket.bindEvent('lobby:group:switchPlayer', this._switchPlayer.bind(this));
  }

  /**
   * Add a new group.
   *
   * @param socket Current socket.
   * @param groupName Name of group.
   * @private
   */
  private _createGroup(socket: AppSocket, groupName: string): void {
    const group = new Group();

    let lastIndex = 0;
    socket.rush.groups.forEach(group => lastIndex = Math.max(lastIndex, group.index));
    group.index = lastIndex + 1;

    if (groupName) {
      const groupNames = socket.rush.groups.map(g => g.name);
      if (groupNames.includes(groupName)) {
        throw new SocketError('groupAlreadyExists', {groupName: groupName});
      }
      group.name = groupName;
    }

    socket.rush.groups.push(group);
    socket.all('lobby:group:created', group);
  }

  /**
   * Update the properties of group.
   *
   * @param socket Current socket.
   * @param data Index of group to update and properties to update.
   * @private
   */
  private _updateGroupProps(socket: AppSocket, data: { groupIndex: number, updatedProps: GroupProps }): void {
    const groupIndex = data.groupIndex;
    const group = RushUtils.findGroup(socket.rush, groupIndex);
    if (!group) {
      throw new SocketError('groupNotFound', {groupIndex: groupIndex});
    }

    const updatedProps = data.updatedProps;
    if (updatedProps.name !== undefined) {
      const groupNames = socket.rush.groups.map(g => g.name);
      if (groupNames.includes(updatedProps.name)) {
        throw new SocketError('groupAlreadyExists', {groupName: updatedProps.name});
      }
      group.name = updatedProps.name;
    }

    if (updatedProps.vehicleName !== undefined) {
      let vehicle: Vehicle;
      if (data.updatedProps.vehicleName) {
        vehicle = SettingsUtils.findVehicle(socket.rush.settings, updatedProps.vehicleName);
        if (!vehicle) {
          throw new SocketError('vehicleNotFound', {vehicleName: updatedProps.vehicleName});
          return;
        }
      }
      group.vehicle = vehicle;
    }

    if (updatedProps.leaderName !== undefined) {
      let leader: Player;
      if (updatedProps.leaderName) {
        leader = GroupUtils.findPlayer(group, updatedProps.leaderName);
        if (!leader) {
          throw new SocketError('playerNotFoundInGroup', {playerName: updatedProps.leaderName, group: group});
        }
      }
      group.leader = leader;
    }

    socket.all('lobby:group:propsUpdated', data);
  }

  /**
   * Remove existing group.
   *
   * @param socket Current socket.
   * @param groupIndex Index of group to remove.
   * @private
   */
  private _removeGroup(socket: AppSocket, groupIndex: number): void {
    const group = RushUtils.deleteGroup(socket.rush, groupIndex);
    if (!group) {
      throw new SocketError('groupNotFound', {groupIndex: groupIndex});
    }
    socket.rush.players.push(...group.players);
    socket.all('lobby:group:removed', {groupIndex: groupIndex});
  }

  /* Player ---------------------------------------------------------------- */
  /**
   * Add player to group.
   *
   * @param socket Current socket.
   * @param data Player to add and index of target group.
   * @private
   */
  private _addPlayer(socket: AppSocket, data: { playerName: string, groupIndex: number }): void {
    const player = RushUtils.findPlayer(socket.rush, data.playerName);
    if (!player) {
      throw new SocketError('playerNotFound', {playerName: data.playerName});
    }

    const group = RushUtils.findGroup(socket.rush, data.groupIndex);
    if (!group) {
      throw new SocketError('groupNotFound', {groupIndex: data.groupIndex});
    }

    RushUtils.deletePlayer(socket.rush, data.playerName);
    group.players.push(player);
    socket.all('lobby:group:playerAdded', data);
  }

  /**
   * Remove player in group.
   *
   * @param socket Current socket.
   * @param data Player to remove and index of target group.
   * @private
   */
  private _removePlayer(socket: AppSocket, data: { playerName: string, groupIndex: number }): void {
    const group = RushUtils.findGroup(socket.rush, data.groupIndex);
    if (!group) {
      throw new SocketError('groupNotFound', {groupIndex: data.groupIndex});
    }

    const playerIndex = GroupUtils.findPlayerIndex(group, data.playerName);
    if (playerIndex < 0) {
      throw new SocketError('playerNotFoundInGroup', data);
    }

    socket.rush.players.push(group.players.splice(playerIndex, 1)[0]);
    socket.all('lobby:group:playerRemoved', data);
  }

  /**
   * Switch player between two groups.
   *
   * @param socket Current socket.
   * @param data Player to switch, index of source group and index of target group.
   * @private
   */
  private _switchPlayer(socket: AppSocket, data: { playerName: string, oldGroupIndex: number, newGroupIndex: number }): void {
    const oldGroup = RushUtils.findGroup(socket.rush, data.oldGroupIndex);
    if (!oldGroup) {
      throw new SocketError('groupNotFound', {groupIndex: data.oldGroupIndex});
    }

    const newGroup = RushUtils.findGroup(socket.rush, data.newGroupIndex);
    if (!newGroup) {
      throw new SocketError('groupNotFound', {groupIndex: data.newGroupIndex});
    }

    const playerIndex = GroupUtils.findPlayerIndex(oldGroup, data.playerName);
    if (playerIndex < 0) {
      throw new SocketError('playerNotFoundInGroup', {playerName: data.playerName, groupIndex: data.oldGroupIndex});
    }

    newGroup.players.push(oldGroup.players.splice(playerIndex, 1)[0]);
    socket.all('lobby:group:playerSwitched', data);
  }
}
