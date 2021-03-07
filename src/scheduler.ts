export interface Scheduler {
  schedule(next: Function): void;
}

export class RecursiveScheduler implements Scheduler {
  schedule(next: Function): void {
    next();
  }
}

export class TimeoutScheduler implements Scheduler {
  schedule(next: () => void): void {
    setTimeout(next, 0);
  }
}

export class NextTickScheduler implements Scheduler {
  schedule(next: () => void) {
    global.setImmediate(next);
  }
}

export class HybridScheduler implements Scheduler {
  private recurseCount = 0;
  constructor(private asyncScheduler = new NextTickScheduler(), private recurseDepth = 100) {}

  schedule(next: () => void): void {
    if (this.recurseCount++ < this.recurseDepth) {
      next();
    } else {
      this.recurseCount = 0;
      this.asyncScheduler.schedule(next);
    }
  }
}
