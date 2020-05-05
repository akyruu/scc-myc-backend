// Shared
import {Group, Player, Rush, Settings} from '../../models';
import {GroupUtils} from './group.utils';

export class RushUtils {
  /* STATIC METHODS ======================================================== */
  static createPlayer(playerName: string): Player {
    const player = new Player();
    player.name = playerName;
    return player;
  }

  static createRush(leader: Player, settings: Settings, single = false): Rush {
    const rush = new Rush();
    rush.leader = leader;
    rush.players.push(leader);
    rush.settings = settings;
    rush.single = single;
    return rush;
  }

  /* Group ----------------------------------------------------------------- */
  static findGroup(rush: Rush, groupIndex: number): Group {
    return rush.groups.find(group => group.index === groupIndex);
  }

  static findGroupIndex(rush: Rush, groupIndex: number): number {
    return rush.groups.findIndex(group => group.index === groupIndex);
  }

  static deleteGroup(rush: Rush, groupIndex: number): Group | false {
    const index = this.findGroupIndex(rush, groupIndex);
    return (index >= 0) ? rush.groups.splice(index, 1)[0] : false;
  }

  /* Player ---------------------------------------------------------------- */
  static isLeader(rush: Rush, playerName: string): boolean {
    return rush.leader?.name === playerName;
  }

  static findPlayer(rush: Rush, playerName: string): Player {
    return rush.players.find(player => player.name === playerName);
  }

  static findPlayerIndex(rush: Rush, playerName: string): number {
    return rush.players.findIndex(player => player.name === playerName);
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

  static findAllPlayers(rush: Rush): Player[] {
    const players = [...rush.players];
    rush.groups.forEach(group => players.push(...group.players));
    return players;
  }

  static deletePlayer(rush: Rush, playerName: string): Player | false {
    const index = this.findPlayerIndex(rush, playerName);
    return (index >= 0) ? rush.players.splice(index, 1)[0] : false;
  }

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
