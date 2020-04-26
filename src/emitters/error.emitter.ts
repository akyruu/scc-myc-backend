import {Socket} from 'socket.io';

/**
 * Emitters for errors.
 *
 * @version 0.1.0
 */
export class ErrorEmitter {
    /* STATIC METHODS ====================================================== */
    static exception(socket: Socket, code: string, data?: object) {
        socket.emit('exception', {code: code, data: data});
    }

    /* CONSTRUCTOR ========================================================= */
    private constructor() {}
}