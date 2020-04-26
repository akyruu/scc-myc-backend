// TODO shared between frontend and backend
import {Settings, Vehicle} from './settings';

export class Room {
    uuid: string;
    leader: string;
    players: string[] = [];
    groups: RoomGroup[] = [];
    settings: Settings;
}

export class RoomGroup {
    name: string;
    leader: string;
    players: string[] = [];
    vehicle: Vehicle;
}
