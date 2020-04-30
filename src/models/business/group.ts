// Shared
import {Cargo} from './cargo';
import {CargoOwner} from './cargo-owner';
import {Player} from './player';
import {Vehicle} from './vehicle';

export class Group implements CargoOwner {
  name: string;
  leader: Player;
  players: Player[] = [];

  vehicle: Vehicle;
  cargo: Cargo;
  cargos: Cargo[] = [];
}

export interface GroupProps {
  name?: string;
  vehicleName?: string;
  leaderName?: string;
}
