import {Player} from './player';
import {PlayerService} from './player.service';
import {Rush} from './rush';

export class RushService {
    /* FIELDS ============================================================== */
    private readonly _rushs = new Map<string, Rush>();

    /* CONSTRUCTOR ========================================================= */
    constructor(
        private _socket: any,
        private _uuid: Function,
        private _playerService: PlayerService,
    ) {}

    /* METHODS ============================================================= */
    create(ownerUuid: string): Rush {
        const rush = new Rush(this._uuid(), ownerUuid);
        this._rushs.set(rush.uuid, rush);
        return rush;
    }

    find(rushUuid: string): Rush {
        return this._rushs.get(rushUuid);
    }

    join(rush: Rush): void {
        if (this._socket.rushUuid) {
            this.leave(this._socket.rushUuid);
        }

        this._socket.rushUuid = rush.uuid;
        this._socket.join(rush.uuid);
        this._socket.emit('rush', rush);

        rush.playerFks.push(this._socket.playerUuid);
        this._socket.brodcast.to(rush.uuid).emit('players', this._playerService.findAll(rush.playerFks));
    }

    leave(rushUuid: string = this._socket.rushUuid): void {
        const rush = this.find(rushUuid);
        this._socket.leave(rush.uuid);

        rush.playerFks.splice(rush.playerFks.indexOf(this._socket.playerUuid), 1);
        if (rush.playerFks.length > 0) {
            this._socket.broadcast.to(rush.uuid).emit('players', this._playerService.findAll(rush.playerFks));
        } else {
            this.delete(rushUuid);
        }
    }

    delete(rushUuid: string): void {
        this._rushs.delete(rushUuid);
    }
}