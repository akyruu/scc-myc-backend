// TODO shared between frontend and backend
import {Box} from './box';
import {Vehicle} from './vehicle';

export class Player {
  name: string;
  vehicle: Vehicle;
  boxes: Box[] = [];

  ready: boolean;
}

export interface PlayerProps {
  vehicleName?: string;
}
