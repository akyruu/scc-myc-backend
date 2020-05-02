import {LobbyGroupEmitter, LobbyRushEmitter} from '../emitters';
import {Group, GroupProps, Player, Vehicle} from '../models';
import {AppSocket} from '../sockets';
import {GroupUtils, RushUtils, SettingsUtils} from '../utils';
import {SocketHandler} from './socket.handler';

/**
 * Handler for group operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyGroupHandler implements SocketHandler {
  /* METHODS ============================================================== */
  bindEvents(socket: AppSocket): void {
    socket.io.on('lobby:group:create', groupName => this._createGroup(socket, groupName))
        .on('lobby:group:updateProps', (data: { groupIndex: number, updatedProps: GroupProps }) =>
            this._updateGroupProps(socket, data.groupIndex, data.updatedProps))
        .on('lobby:group:remove', groupIndex => this._removeGroup(socket, groupIndex));

    // Player
    socket.io.on('lobby:group:addPlayer', (data: { playerName: string, groupIndex: number }) =>
        this._addPlayer(socket, data.playerName, data.groupIndex))
        .on('lobby:group:removePlayer', (data: { playerName: string, groupIndex: number }) =>
            this._removePlayer(socket, data.playerName, data.groupIndex))
        .on('lobby:group:switchPlayer', (data: { playerName: string, oldGroupIndex: number, newGroupIndex: number }) =>
            this._switchPlayer(socket, data.playerName, data.oldGroupIndex, data.newGroupIndex));

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
        LobbyGroupEmitter.groupAlreadyExists(socket.io, groupName);
        return;
      }
      group.name = groupName;
    }

    socket.rush.groups.push(group);
    LobbyGroupEmitter.groupCreated(socket, group);
  }

  /**
   * Update the properties of group.
   *
   * @param socket Current socket.
   * @param groupIndex Index of group to update.
   * @param updatedProps Updated properties of group.
   * @private
   */
  private _updateGroupProps(socket: AppSocket, groupIndex: number, updatedProps: GroupProps) {
    const group = RushUtils.findGroup(socket.rush, groupIndex);
    if (!group) {
      LobbyGroupEmitter.groupNotFound(socket, groupIndex);
      return;
    }

    if (updatedProps.name !== undefined) {
      const groupNames = socket.rush.groups.map(g => g.name);
      if (groupNames.includes(updatedProps.name)) {
        LobbyGroupEmitter.groupAlreadyExists(socket.io, updatedProps.name);
        return;
      }
      group.name = updatedProps.name;
    }

    if (updatedProps.vehicleName !== undefined) {
      let vehicle: Vehicle;
      if (updatedProps.vehicleName) {
        vehicle = SettingsUtils.findVehicle(socket.rush.settings, updatedProps.vehicleName);
        if (!vehicle) {
          LobbyRushEmitter.vehicleNotFound(socket.io, updatedProps.vehicleName);
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
          LobbyGroupEmitter.playerNotFound(socket, updatedProps.leaderName, groupIndex);
          return;
        }
      }
      group.leader = leader;
    }

    LobbyGroupEmitter.groupPropsUpdated(socket, groupIndex, updatedProps);
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
      LobbyGroupEmitter.groupNotFound(socket, groupIndex);
    } else {
      socket.rush.players.push(...group.players);
      LobbyGroupEmitter.groupRemoved(socket, groupIndex);
    }
  }

  /* Player ---------------------------------------------------------------- */
  /**
   * Add player to group.
   *
   * @param socket Current socket.
   * @param playerName Player to add.
   * @param groupIndex Index of target group.
   * @private
   */
  private _addPlayer(socket: AppSocket, playerName: string, groupIndex: number) {
    const player = RushUtils.findPlayer(socket.rush, playerName);
    if (!player) {
      LobbyGroupEmitter.playerNotFound(socket, playerName, groupIndex);
      return;
    }

    const group = RushUtils.findGroup(socket.rush, groupIndex);
    if (!group) {
      LobbyGroupEmitter.groupNotFound(socket, groupIndex);
      return;
    }

    RushUtils.deletePlayer(socket.rush, playerName);
    group.players.push(player);
    LobbyGroupEmitter.playerAdded(socket, playerName, groupIndex);
  }

  /**
   * Remove player in group.
   *
   * @param socket Current socket.
   * @param playerName Player to remove.
   * @param groupIndex Index of target group.
   * @private
   */
  private _removePlayer(socket: AppSocket, playerName: string, groupIndex: number) {
    const group = RushUtils.findGroup(socket.rush, groupIndex);
    if (!group) {
      LobbyGroupEmitter.groupNotFound(socket, groupIndex);
      return;
    }

    const playerIndex = group.players.findIndex(player => player.name === playerName);
    if (playerIndex < 0) {
      LobbyGroupEmitter.playerNotFound(socket, playerName, groupIndex);
      return;
    }

    socket.rush.players.push(group.players.splice(playerIndex, 1)[0]);
    LobbyGroupEmitter.playerRemoved(socket, playerName, groupIndex);
  }

  /**
   * Switch player between two groups.
   *
   * @param socket Current socket.
   * @param playerName Player to switch.
   * @param oldGroupIndex Index of source group.
   * @param newGroupIndex Index of target group.
   * @private
   */
  private _switchPlayer(socket: AppSocket, playerName: string, oldGroupIndex: number, newGroupIndex: number) {
    const oldGroup = RushUtils.findGroup(socket.rush, oldGroupIndex);
    if (!oldGroup) {
      LobbyGroupEmitter.groupNotFound(socket, oldGroupIndex);
      return;
    }

    const newGroup = RushUtils.findGroup(socket.rush, newGroupIndex);
    if (!newGroup) {
      LobbyGroupEmitter.groupNotFound(socket, newGroupIndex);
      return;
    }

    const playerIndex = oldGroup.players.findIndex(player => player.name === playerName);
    if (playerIndex < 0) {
      LobbyGroupEmitter.playerNotFound(socket, playerName, oldGroupIndex);
      return;
    }

    newGroup.players.push(oldGroup.players.splice(playerIndex, 1)[0]);
    LobbyGroupEmitter.playerSwitched(socket, playerName, oldGroupIndex, newGroupIndex);
  }
}
