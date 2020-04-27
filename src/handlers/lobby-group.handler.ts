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
        .on('lobby:group:updateProps', (data: { groupName: string, updatedProps: GroupProps }) =>
            this._updateGroupProps(socket, data.groupName, data.updatedProps))
        .on('lobby:group:remove', groupName => this._removeGroup(socket, groupName));

    // Player
    socket.io.on('lobby:group:addPlayer', (data: { playerName: string, groupName: string }) =>
        this._addPlayer(socket, data.playerName, data.groupName))
        .on('lobby:group:removePlayer', (data: { playerName: string, groupName: string }) =>
            this._removePlayer(socket, data.playerName, data.groupName))
        .on('lobby:group:switchPlayer', (data: { playerName: string, oldGroupName: string, newGroupName: string }) =>
            this._switchPlayer(socket, data.playerName, data.oldGroupName, data.newGroupName));

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

    const groupNames = socket.rush.groups.map(g => g.name);
    if (groupNames.includes(groupName)) {
      const groups = groupName.match(/([^0-9]+)[0-9]+$/g);
      const baseName = (groups ? groups[1] : groupName);

      let copy = (socket.rush.groups.length + 1);
      do {
        group.name = baseName + (copy++);
      } while (groupNames.includes(group.name));
    } else {
      group.name = groupName;
    }

    socket.rush.groups.push(group);
    LobbyGroupEmitter.groupCreated(socket, group);
  }

  /**
   * Update the properties of group.
   *
   * @param socket Current socket.
   * @param groupName Name of group to update.
   * @param updatedProps Updated properties of group.
   * @private
   */
  private _updateGroupProps(socket: AppSocket, groupName: string, updatedProps: GroupProps) {
    const group = RushUtils.findGroup(socket.rush, groupName);
    if (!group) {
      LobbyGroupEmitter.groupNotFound(socket, groupName);
      return;
    }

    if (updatedProps.name !== undefined) {
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
          LobbyGroupEmitter.playerNotFound(socket, updatedProps.leaderName, groupName);
          return;
        }
      }
      group.leader = leader;
    }

    LobbyGroupEmitter.groupPropsUpdated(socket, groupName, updatedProps);
  }

  /**
   * Remove existing group.
   *
   * @param socket Current socket.
   * @param groupName Name of group to remove.
   * @private
   */
  private _removeGroup(socket: AppSocket, groupName: string): void {
    const group = RushUtils.deleteGroup(socket.rush, groupName);
    if (!group) {
      LobbyGroupEmitter.groupNotFound(socket, groupName);
    } else {
      socket.rush.players.push(...group.players);
      LobbyGroupEmitter.groupRemoved(socket, groupName);
    }
  }

  /* Player ---------------------------------------------------------------- */
  /**
   * Add player to group.
   *
   * @param socket Current socket.
   * @param playerName Player to add.
   * @param groupName Name of target group.
   * @private
   */
  private _addPlayer(socket: AppSocket, playerName: string, groupName: string) {
    const player = RushUtils.findPlayer(socket.rush, playerName);
    if (!player) {
      LobbyRushEmitter.playerNotFound(socket.io, playerName, groupName);
      return;
    }

    const group = RushUtils.findGroup(socket.rush, groupName);
    if (!group) {
      LobbyGroupEmitter.groupNotFound(socket, groupName);
      return;
    }

    RushUtils.deletePlayer(socket.rush, playerName);
    group.players.push(player);
    LobbyGroupEmitter.playerAdded(socket, playerName, groupName);
  }

  /**
   * Remove player in group.
   *
   * @param socket Current socket.
   * @param playerName Player to remove.
   * @param groupName Name of target group.
   * @private
   */
  private _removePlayer(socket: AppSocket, playerName: string, groupName: string) {
    const group = RushUtils.findGroup(socket.rush, groupName);
    if (!group) {
      LobbyGroupEmitter.groupNotFound(socket, groupName);
      return;
    }

    const playerIndex = group.players.findIndex(player => player.name === playerName);
    if (playerIndex < 0) {
      LobbyGroupEmitter.playerNotFound(socket, playerName, groupName);
      return;
    }

    socket.rush.players.push(group.players.splice(playerIndex, 1)[0]);
    LobbyGroupEmitter.playerRemoved(socket, playerName, groupName);
  }

  /**
   * Switch player between two groups.
   *
   * @param socket Current socket.
   * @param playerName Player to switch.
   * @param oldGroupName Name of source group.
   * @param newGroupName Name of target group.
   * @private
   */
  private _switchPlayer(socket: AppSocket, playerName: string, oldGroupName: string, newGroupName: string) {
    const oldGroup = RushUtils.findGroup(socket.rush, oldGroupName);
    if (!oldGroup) {
      LobbyGroupEmitter.groupNotFound(socket, oldGroupName);
      return;
    }

    const newGroup = RushUtils.findGroup(socket.rush, newGroupName);
    if (!newGroup) {
      LobbyGroupEmitter.groupNotFound(socket, newGroupName);
      return;
    }

    const playerIndex = oldGroup.players.findIndex(player => player.name === playerName);
    if (playerIndex < 0) {
      LobbyGroupEmitter.playerNotFound(socket, playerName, oldGroupName);
      return;
    }

    newGroup.players.push(oldGroup.players.splice(playerIndex, 1)[0]);
    LobbyGroupEmitter.playerSwitched(socket, playerName, oldGroupName, newGroupName);
  }
}