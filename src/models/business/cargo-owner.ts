import {Cargo} from './cargo';
import {Vehicle} from './vehicle';

export interface CargoOwner {
  vehicle: Vehicle;
  cargo: Cargo;
  cargos: Cargo[];
}
