// Shared
import {Group} from './group';
import {Player} from './player';
import {Settings} from './settings';

export class Rush {
  uuid: string;
  leader: Player;
  players: Player[] = [];
  groups: Group[] = [];
  settings: Settings;
  single: boolean;

  launched = false;
}
