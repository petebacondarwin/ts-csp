export class Channel<T> {
  private state: 'OPEN'|'CLOSED'|'ENDED' = 'OPEN';
  private pendingTakes: PendingTakeFn<T>[] = [];
  private pendingPuts: PendingPutFn<T>[] = [];

  take(): Promise<T> {
    if (this.pendingPuts.length) {
      const pendingPut = this.pendingPuts.shift();
      return new Promise(resolve => pendingPut(resolve));
    }
    return new Promise(resolve => {
      this.pendingTakes.push(value => resolve(value));
    });

  }

  put(value: T): Promise<void> {
    if (this.pendingTakes.length) {
      this.pendingTakes.shift()(value);
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.pendingPuts.push(pendingTake => {
        pendingTake(value);
        resolve();
      });
    });
  }
}

type PendingTakeFn<T> = (value: T) => void;
type PendingPutFn<T> = (pendingGet: PendingTakeFn<T>) => void;
