import {Logger} from 'pino';
import {SocketContext, SocketError} from '../models';
import {ServerData} from '../server.data';
import {AppSocket} from '../sockets';
import {RushUtils} from '../utils';
import {SocketHandler} from './socket.handler';

/**
 * Handler for rush operations.
 *
 * @version 0.1.0
 */
export class RushHandler implements SocketHandler {
  /* CONSTRUCTOR =========================================================== */
  constructor(private _data: ServerData, private _logger: Logger) {}

  /* METHODS =============================================================== */
  bindEvents(socket: AppSocket): void {
    socket.bindEvent('rush:create', this._createRush.bind(this));
    socket.bindEvent('rush:join', this._joinRush.bind(this));
    socket.bindEvent('rush:launch', this._launchRush.bind(this));
    socket.bindEvent('rush:leave', this.leaveRush.bind(this));
  }

  /* Rush ---------------------------------------------------------------- */
  /**
   * Create a new rush and join it.
   * The player is the leader of this rush.
   *
   * @param socket Socket.
   * @param playerName Player name assigned to leader.
   * @return Socket context.
   * @private
   */
  private _createRush(socket: AppSocket, playerName: string): SocketContext {
    const player = RushUtils.createPlayer(playerName);
    const settings = require('../../data/settings.json');
    const rush = RushUtils.createRush(player, settings);

    socket.join(player, rush);
    this._data.addRush(rush);
    this._logger.info('New rush <%s> create by player <%s>', rush.uuid, playerName);

    return {player: player, rush: rush};
  }

  /**
   * Join an existing rush. The player must be unique.
   *
   * @param socket Current socket.
   * @param data Player name and party identifier to join.
   * @return Socket context.
   * @private
   */
  private _joinRush(socket: AppSocket, data: { playerName: string, rushUuid: string }): SocketContext {
    const rush = this._data.findRush(data.rushUuid);
    if (RushUtils.findPlayer(rush, data.playerName)) {
      throw new SocketError('playerAlreadyExists', data);
    }

    const player = RushUtils.createPlayer(data.playerName);
    socket.join(player, rush);
    rush.players.push(player);
    this._logger.info('Player <%s> join rush <%s>', data.playerName, data.rushUuid);

    socket.broadcast('rush:playerJoined', player);
    return {player: player, rush: rush};
  }

  /**
   * Launch the current rush.
   *
   * @param socket Current socket.
   * @private
   */
  private _launchRush(socket: AppSocket): void {
    if (socket.rush.launched) {
      throw new SocketError('rushAlreadyLaunched', {rushUuid: socket.rush.uuid});
    }

    socket.rush.launched = true;
    this._logger.info('The rush <%s> is launched', socket.rush.uuid);

    socket.all('rush:launched');
  }

  /**
   * Leave a joined rush if exists.
   *
   * @param socket Current socket.
   */
  leaveRush(socket: AppSocket): void {
    if (socket.rush?.uuid) {
      RushUtils.deletePlayerDeep(socket.rush, socket.player.name);
      this._logger.info('Player <%s> leave rush <%s>', socket.player.name, socket.rush.uuid);

      if (RushUtils.isEmptyDeep(socket.rush)) {
        this._data.deleteRush(socket.rush);
        this._logger.info('Rush <%s> removed because no player connected', socket.rush.uuid);
      } else {
        socket.broadcast('rush:playerLeaved', socket.player.name);
      }
      socket.leave();
    }
  }
}
