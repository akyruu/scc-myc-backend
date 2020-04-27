// TODO shared between frontend and backend
import {Vehicle} from './vehicle';

export class Player {
  name: string;
  vehicle: Vehicle;

  ready: boolean;
}

export interface PlayerProps {
  vehicleName?: string;
}
