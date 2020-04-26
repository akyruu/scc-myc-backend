import {AppSocket} from '../sockets';

/**
 * Interface for all socket handlers.
 *
 * @version 0.1.0
 */
export interface SocketHandler {
    /* METHODS ============================================================== */
    /**
     * Bind socket events.
     * Call this method in socket connection event.
     *
     * @param socket Current socket.
     */
    bindEvents(socket: AppSocket): void;
}