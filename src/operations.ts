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
