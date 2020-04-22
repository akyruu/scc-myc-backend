import {Player} from './player';

export class PlayerService {
    /* FIELDS ============================================================== */
    private readonly _players = new Map<string, Player>();

    /* CONSTRUCTOR ========================================================= */
    constructor(private _socket: any, private _uuid: Function) {}

    /* METHODS ============================================================= */
    create(playerName: string): Player {
        const player = new Player(playerName, this._uuid());
        this._players.set(player.uuid, player);

        this._socket.playerUuid = player.uuid;
        this._socket.emit('player', player);
        return player;
    }

    find(playerUuid: string): Player {
        return this._players.get(playerUuid);
    }

    findAll(playerUuids: string[]): Player[] {
        return playerUuids.map(playerUuid => this._players.get(playerUuid));
    }

    delete() {
        if (this._socket.playerUuid) {
            this._players.delete(this._socket.playerUuid);
            delete this._socket.playerUuid;
        }
    }
}