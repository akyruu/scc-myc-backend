// Shared
import {Group, Player, Rush} from '../../models';
import {GroupUtils} from './group.utils';

export class RushUtils {
  /* STATIC METHODS ====================================================== */
  static findGroup(rush: Rush, groupName: string): Group {
    return rush.groups.find(group => group.name === groupName);
  }

  static deleteGroup(rush: Rush, groupName: string): Group | false {
    const index = rush.groups.findIndex(group => group.name === groupName);
    return (index >= 0) ? rush.groups.splice(index, 1)[0] : false;
  }

  /* Player ---------------------------------------------------------------- */
  static isLeader(rush: Rush, playerName: string): boolean {
    return rush.leader?.name === playerName;
  }

  static findPlayer(rush: Rush, playerName: string): Player {
    return rush.players.find(player => player.name === playerName);
  }

  static findPlayerDeep(rush: Rush, playerName: string): Player {
    let player = this.findPlayer(rush, playerName);
    if (!player) {
      for (const group of rush.groups) {
        player = GroupUtils.findPlayer(group, playerName);
        if (player) {
          break;
        }
      }
    }
    return player;
  }

  static deletePlayer(rush: Rush, playerName: string): Player | false {
    const index = rush.players.findIndex(player => player.name === playerName);
    return (index >= 0) ? rush.players.splice(index, 1)[0] : false;
  }

  /* All ------------------------------------------------------------------- */
  static deletePlayerDeep(rush: Rush, playerName: string): void {
    let player = this.deletePlayer(rush, playerName);
    if (!player) {
      for (const group of rush.groups) {
        player = GroupUtils.deletePlayer(group, playerName);
        if (player) {
          break;
        }
      }
    }
  }

  static isEmptyDeep(rush: Rush): boolean {
    return rush.players.length === 0 && rush.groups.every(group => group.players.length === 0);
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}
