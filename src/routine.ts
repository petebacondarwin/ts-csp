import {NoopOperation, StopOperation, SleepOperation, PutOperation, TakeOperation} from "./operations";
import {Scheduler} from "./scheduler";

export class Routine<T = unknown, TReturn = any, TNext = unknown> {
  state: 'RUNNING' | 'PAUSED' | 'COMPLETE' = 'RUNNING';
  private resolveComplete: () => void;
  completed: Promise<void>;

  constructor(private generator: Generator<T, TReturn, TNext>, private scheduler: Scheduler) {
    this.completed = new Promise<void>(resolve => this.resolveComplete = resolve);
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
      this.resolveComplete();
    } else {
      this.handleNext(step.value);
    }
  }

  private handleNext(op: any) {
    if (op instanceof PutOperation) {
      this.handleNext(op.ch.put(op.value));
    } else if (op instanceof TakeOperation) {
      this.handleNext(op.ch.take());
    } else if (op instanceof NoopOperation) {
      this.scheduleNext();
    } else if (op instanceof StopOperation) {
      this.state = 'PAUSED';
    } else if (op instanceof SleepOperation) {
      setTimeout(() => this.next(), op.time);
    } else if (op instanceof Promise) {
      op.then(
        resolvedValue => this.handleNext(resolvedValue),
        rejectedValue => this.handleStep(this.generator.throw(rejectedValue))
      );
    } else {
      this.scheduleNext(op);
    }
  }
}
