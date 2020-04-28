// Shared
import {Group, Player} from '../../models';

export class GroupUtils {
  /* STATIC METHODS ====================================================== */
  static isLeader(group: Group, playerName: string): boolean {
    return group.leader?.name === playerName;
  }

  static findPlayer(group: Group, playerName: string): Player {
    return group.players.find(player => player.name === playerName);
  }

  static deletePlayer(group: Group, playerName: string): Player | false {
    const index = group.players.findIndex(player => player.name === playerName);
    return (index >= 0) ? group.players.splice(index, 1)[0] : false;
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}
