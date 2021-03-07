import {NoopOperation, StopOperation, SleepOperation} from "./operations";
import {Scheduler} from "./scheduler";

export class Routine<T = unknown, TReturn = any, TNext = unknown> {
  state: 'RUNNING' | 'PAUSED' | 'COMPLETE' = 'RUNNING';

  constructor(private generator: Generator<T, TReturn, TNext>, private scheduler: Scheduler) {
    this.scheduleNext();
  }

  private scheduleNext(result?: any): void {
    this.scheduler.schedule(() => this.next(result));
  }

  private next(result?: any) {
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
