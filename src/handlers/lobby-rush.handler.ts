import {LobbyRushEmitter} from '../emitters';
import {Player, Rush} from '../models';
import {AppSocket} from '../sockets';
import {RushUtils, UuidUtils} from '../utils';
import {SocketHandler} from './socket.handler';

/**
 * Handler for rush operations in lobby.
 *
 * @version 0.1.0
 */
export class LobbyRushHandler implements SocketHandler {
  /* FIELDS =============================================================== */
  /** All rushs created on server */
  private readonly _rushs = new Map<string, Rush>();

  /* METHODS ============================================================== */
  bindEvents(socket: AppSocket): void {
    socket.io.on('lobby:rush:create', (data: { playerName: string, single: boolean }) =>
        this._createRush(socket, data.playerName, data.single))
        .on('lobby:rush:join', (data: { playerName: string, rushUuid: string }) =>
            this._joinRush(socket, data.playerName, data.rushUuid))
        .on('lobby:rush:launch', () => this._launchRush(socket))
        .on('lobby:rush:leave', this.leaveRush.bind(this, socket));
  }

  /* Rush ---------------------------------------------------------------- */
  /**
   * Create a new rush and join it.
   * The player is the leader of this rush.
   *
   * @param socket Current socket.
   * @param playerName Player's name (leader).
   * @param single One player only mode.
   * @private
   */
  private _createRush(socket: AppSocket, playerName: string, single: boolean): void {
    const rushUuid = UuidUtils.generateUuid(Array.from(this._rushs.keys()));

    const player = new Player();
    player.name = playerName;

    const rush = new Rush();
    rush.uuid = rushUuid;
    rush.leader = player;
    rush.players.push(player);
    rush.settings = require('../../data/settings.json');
    rush.single = single;
    this._rushs.set(rushUuid, rush);

    socket.io.join(rushUuid);
    socket.player = player;
    socket.rush = rush;

    LobbyRushEmitter.rushCreated(socket.io, player, rush);
  }

  /**
   * Join an existing rush. The player must be unique.
   *
   * @param socket Current socket.
   * @param playerName Player's name.
   * @param rushUuid Identifier of rush to join.
   * @private
   */
  private _joinRush(socket: AppSocket, playerName: string, rushUuid: string): void {
    const rush = this._rushs.get(rushUuid);
    if (!rush) {
      LobbyRushEmitter.rushNotFound(socket.io, rushUuid);
    } else if (RushUtils.findPlayer(rush, playerName)) {
      LobbyRushEmitter.playerAlreadyExistsInRush(socket.io, playerName, rushUuid);
    }

    const player = new Player();
    player.name = playerName;

    socket.io.join(rushUuid);
    socket.player = player;
    socket.rush = rush;

    rush.players.push(player);
    LobbyRushEmitter.rushJoined(socket.io, player, rush);
  }

  /**
   * Launch the current rush.
   *
   * @param socket Current socket.
   * @private
   */
  private _launchRush(socket: AppSocket) {
    if (socket.rush.launched) {
      LobbyRushEmitter.rushAlreadyLaunched(socket.io);
      return;
    }

    socket.rush.launched = true;
    LobbyRushEmitter.rushLaunched(socket);
  }

  /**
   * Leave a joined rush if exists.
   *
   * @param socket Current socket.
   */
  leaveRush(socket: AppSocket): void {
    if (socket.rush?.uuid) {
      socket.io.leave(socket.rush.uuid);

      RushUtils.deletePlayerDeep(socket.rush, socket.player.name);
      if (RushUtils.isEmptyDeep(socket.rush)) {
        this._rushs.delete(socket.rush.uuid);
      }

      LobbyRushEmitter.rushLeaved(socket);
      delete socket.player;
      delete socket.rush;
    }
  }
}