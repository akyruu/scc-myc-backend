export class Rush {
    constructor(
        public uuid: string,
        public ownerFk: string,
        public playerFks: string[] = []
    ) {}
}