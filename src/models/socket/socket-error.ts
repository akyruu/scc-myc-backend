export class SocketError {
  constructor(
      public readonly code: string,
      public readonly data?: object
  ) {}
}
