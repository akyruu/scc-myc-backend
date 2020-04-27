// TODO shared between frontend and backend
import {Player} from './player';
import {Vehicle} from './vehicle';

export class Group {
  name: string;
  leader: Player;
  players: Player[] = [];
  vehicle: Vehicle;
}

export interface GroupProps {
  name?: string;
  vehicleName?: string;
  leaderName?: string;
}
