import {Room, RoomGroup} from '../models';

export class RoomUtils {
    /* STATIC METHODS ====================================================== */
    static findGroup(room: Room, groupName: string): RoomGroup {
        return room.groups.find(group => group.name === groupName);
    }

    static findGroupIndex(room: Room, groupName: string): number {
        return room.groups.findIndex(group => group.name === groupName);
    }

    static isEmpty(room: Room): boolean {
        if (room.players.length > 0) {
            return false;
        }
        return room.groups.every(group => group.players.length === 0);
    }

    static removePlayer(room: Room, player: string): void {
        let playerIndex = room.players.indexOf(player);
        if (playerIndex >= 0) {
            room.players.splice(playerIndex, 1);
        } else {
            for (const group of room.groups) {
                playerIndex = group.players.indexOf(player);
                if (playerIndex >= 0) {
                    group.players.splice(playerIndex, 1);
                }
            }
        }
    }

    /* CONSTRUCTOR ========================================================= */
    private constructor() {}

}