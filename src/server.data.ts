import {Rush, SocketError} from './models';
import {UuidUtils} from './utils';

export class ServerData {
  /* FIELDS ================================================================ */
  private static readonly _rushByUuid = new Map<string, Rush>();

  /* METHODS =============================================================== */
  addRush(rush: Rush): void {
    rush.uuid = UuidUtils.generateUuid(Array.from(ServerData._rushByUuid.keys()));
    ServerData._rushByUuid.set(rush.uuid, rush);
  }

  findRush(rushUuid: string): Rush {
    const rush = ServerData._rushByUuid.get(rushUuid);
    if (rush === null) {
      throw new SocketError('rushNotFound', {rushUuid: rushUuid});
    }
    return rush;
  }

  deleteRush(rush: Rush): boolean {
    return ServerData._rushByUuid.delete(rush.uuid);
  }
}
