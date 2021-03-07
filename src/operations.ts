import {Channel} from "./channel";

export type Operation = NoopOperation | StopOperation | SleepOperation;

export class NoopOperation {}
export function noop(): NoopOperation {
  return new NoopOperation();
}

export class StopOperation {}
export function stop(): StopOperation {
  return new StopOperation();
}

export class SleepOperation {
  constructor(readonly time: number) {}
}
export function sleep(time: number): SleepOperation {
  return new SleepOperation(time);
}

export class PutOperation<T> {
  constructor(readonly ch: Channel<T>, readonly value: T) {}
}
export function put<T>(ch: Channel<T>, value: T): PutOperation<T> {
  return new PutOperation(ch, value);
}

export class TakeOperation<T> {
  constructor(readonly ch: Channel<T>) {}
}
export function take<T>(ch: Channel<T>): TakeOperation<T> {
  return new TakeOperation(ch);
}
