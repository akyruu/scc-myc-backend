import {SocketError} from './socket-error';

export interface SocketResult<T> {
  readonly status: 'success' | 'failed';
  readonly error?: SocketError;
  readonly payload?: T
}

export class SocketSuccess<T> implements SocketResult<T> {
  readonly status = 'success';

  constructor(public readonly payload: T) {}
};

export class SocketFailed implements SocketResult<any> {
  readonly status = 'failed';

  constructor(public readonly error: SocketError) {}
}
