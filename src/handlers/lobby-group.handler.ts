import {LobbyGroupEmitter, LobbyRoomEmitter} from '../emitters';
import {RoomGroup, Vehicle} from '../models';
import {AppSocket} from '../sockets';
import {RoomUtils, SettingsUtils} from '../utils';
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
            .on('lobby:group:updateProps', (data: { groupName: string, updatedProps: { name?: string, vehicleName?: string } }) =>
                this._updateGroupProps(socket, data.groupName, data.updatedProps))
            .on('lobby:group:remove', groupName => this._removeGroup(socket, groupName));

        // Player
        socket.io.on('lobby:group:addPlayer', (data: { player: string, groupName: string }) =>
            this._addPlayer(socket, data.player, data.groupName))
            .on('lobby:group:removePlayer', (data: { player: string, groupName: string }) =>
                this._removePlayer(socket, data.player, data.groupName))
            .on('lobby:group:switchPlayer', (data: { player: string, oldGroupName: string, newGroupName: string }) =>
                this._switchPlayer(socket, data.player, data.oldGroupName, data.newGroupName));

    }

    /**
     * Add a new group.
     *
     * @param socket Current socket.
     * @param groupName Name of group.
     * @private
     */
    private _createGroup(socket: AppSocket, groupName: string): void {
        const group = new RoomGroup();

        const groupNames = socket.room.groups.map(g => g.name);
        if (groupNames.includes(groupName)) {
            const groups = groupName.match(/([^0-9]+)[0-9]+$/g);
            const baseName = (groups ? groups[1] : groupName);

            let copy = (socket.room.groups.length + 1);
            do {
                group.name = baseName + (copy++);
            } while (groupNames.includes(group.name));
        } else {
            group.name = groupName;
        }

        socket.room.groups.push(group);
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
    private _updateGroupProps(socket: AppSocket, groupName: string, updatedProps: { name?: string, vehicleName?: string }) {
        const group = RoomUtils.findGroup(socket.room, groupName);
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
                vehicle = SettingsUtils.findVehicle(socket.room.settings, updatedProps.vehicleName);
                if (!vehicle) {
                    LobbyRoomEmitter.vehicleNotFound(socket.io, updatedProps.vehicleName);
                    return;
                }
            }
            group.vehicle = vehicle;
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
        const groupIndex = RoomUtils.findGroupIndex(socket.room, groupName);
        if (groupIndex < 0) {
            LobbyGroupEmitter.groupNotFound(socket, groupName);
            return;
        }
        socket.room.groups.splice(groupIndex, 1);
        LobbyGroupEmitter.groupRemoved(socket, groupName);
    }

    /* Player ---------------------------------------------------------------- */
    /**
     * Add player to group.
     *
     * @param socket Current socket.
     * @param player Player to add.
     * @param groupName Name of target group.
     * @private
     */
    private _addPlayer(socket: AppSocket, player: string, groupName: string) {
        const playerIndex = socket.room.players.indexOf(player);
        if (playerIndex < 0) {
            LobbyRoomEmitter.playerNotFound(socket.io, player, groupName);
            return;
        }

        const group = RoomUtils.findGroup(socket.room, groupName);
        if (!group) {
            LobbyGroupEmitter.groupNotFound(socket, groupName);
            return;
        }

        group.players.push(socket.room.players.splice(playerIndex, 1)[0]);
        LobbyGroupEmitter.playerAdded(socket, player, groupName);
    }

    /**
     * Remove player in group.
     *
     * @param socket Current socket.
     * @param player Player to remove.
     * @param groupName Name of target group.
     * @private
     */
    private _removePlayer(socket: AppSocket, player: string, groupName: string) {
        const group = RoomUtils.findGroup(socket.room, groupName);
        if (!group) {
            LobbyGroupEmitter.groupNotFound(socket, groupName);
            return;
        }

        const playerIndex = group.players.indexOf(player);
        if (playerIndex < 0) {
            LobbyGroupEmitter.playerNotFound(socket, player, groupName);
            return;
        }

        socket.room.players.push(group.players.splice(playerIndex, 1)[0]);
        LobbyGroupEmitter.playerRemoved(socket, player, groupName);
    }

    /**
     * Switch player between two groups.
     *
     * @param socket Current socket.
     * @param player Player to switch.
     * @param oldGroupName Name of source group.
     * @param newGroupName Name of target group.
     * @private
     */
    private _switchPlayer(socket: AppSocket, player: string, oldGroupName: string, newGroupName: string) {
        const oldGroup = RoomUtils.findGroup(socket.room, oldGroupName);
        if (!oldGroup) {
            LobbyGroupEmitter.groupNotFound(socket, oldGroupName);
            return;
        }

        const newGroup = RoomUtils.findGroup(socket.room, newGroupName);
        if (!newGroup) {
            LobbyGroupEmitter.groupNotFound(socket, newGroupName);
            return;
        }

        const playerIndex = oldGroup.players.indexOf(player);
        if (playerIndex < 0) {
            LobbyGroupEmitter.playerNotFound(socket, player, oldGroupName);
            return;
        }

        newGroup.players.push(oldGroup.players.splice(playerIndex, 1)[0]);
        LobbyGroupEmitter.playerSwitched(socket, player, oldGroupName, newGroupName);
    }
}