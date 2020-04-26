import {v4} from 'uuid';

export class UuidUtils {
    /* STATIC METHODS ====================================================== */
    static generateUuid(existingUuids: string[] = []): string {
        let uuid: string;
        while (existingUuids.includes(uuid = v4())) {}
        return uuid;
    }

    /* CONSTRUCTOR ========================================================= */
    private constructor() {}

}