// Shared
import {Box} from './box';
import {Cargo} from './cargo';
import {CargoOwner} from './cargo-owner';
import {Vehicle} from './vehicle';

export class Player implements CargoOwner {
  name: string;

  vehicle: Vehicle;
  cargo: Cargo;
  cargos: Cargo[] = [];

  rucksack: Box;
  boxes: Box[] = [];

  ready: boolean;
}

export interface PlayerProps {
  vehicleName?: string;
}
