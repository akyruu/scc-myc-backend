// TODO shared between frontend and backend
import {Group} from './group';
import {Player} from './player';
import {Settings} from './settings';

export class Rush {
  uuid: string;
  leader: Player;
  players: Player[] = [];
  groups: Group[] = [];
  settings: Settings;

  solo = false;
  launched = false;
}
