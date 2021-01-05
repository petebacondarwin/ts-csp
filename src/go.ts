import {NoopOperation, StopOperation, SleepOperation} from "./operations";

export type ScheduleFn = (next: Function) => void;

export class Routine {
  state: 'RUNNING' | 'PAUSED' | 'COMPLETE' = 'RUNNING';
  private generator = this.genFn(...this.args);

  constructor(private genFn: (...args: any) => Generator, private args: any[], private scheduler: ScheduleFn) {
    this.scheduleNext();
  }

  private scheduleNext(result?: any): void {
    this.scheduler(() => this.next(result));
  }

  private next(result?: any) {
    if (this.state === 'PAUSED' || this.state === 'COMPLETE') return;
    this.handleStep(this.generator.next(result));
  }

  private handleStep(step: IteratorResult<unknown>) {
    if (step.done === true) {
      this.state = 'COMPLETE';
    } else {
      this.handleNext(step.value);
    }
  }

  private handleNext(value: any) {
    if (value instanceof NoopOperation) {
      this.scheduleNext();
    } else if (value instanceof StopOperation) {
      this.state = 'PAUSED';
    } else if (value instanceof SleepOperation) {
      setTimeout(() => this.next(), value.time);
    } else if (value instanceof Promise) {
      value.then(
        resolvedValue => {
          this.handleNext(resolvedValue);
        },
        rejectedValue => {
          this.handleStep(this.generator.throw(rejectedValue));
        }
      );
    } else {
      this.scheduleNext(value);
    }
  }
}

export function go(genFn: (...args: any) => Generator, ...args: any[]): Routine {
  const syncScheduler: ScheduleFn = fn => fn();
  return new Routine(genFn, args, syncScheduler);
}
