/**
 * @jest-environment node
 */
import {Routine} from './routine';
import {noop, Operation, sleep, stop} from './operations';
import {RecursiveScheduler} from './scheduler';

describe('Routine', () => {
  it('should start in a running state', () => {
    jest.useFakeTimers();
    function* generatorFn() {
      yield sleep(1000);
    }
    const routine = new Routine(generatorFn(), new RecursiveScheduler());
    expect(routine.state).toEqual('RUNNING');
  });

  it('should put the routine in the COMPLETE state when the generator completes implicitly', () => {
    function* genFn() {
      yield noop();
    }
    const routine = new Routine(genFn(), new RecursiveScheduler());
    expect(routine.state).toEqual('COMPLETE');
  });

  it('should put the routine in the COMPLETE state when the generator completes explicitly', () => {
    function* genFn() {
      return 100;
    }
    const routine = new Routine(genFn(), new RecursiveScheduler());
    expect(routine.state).toEqual('COMPLETE');
  });

  it('should put the routine in the PAUSED state when the generator yields a STOP', () => {
    function* genFn() {
      yield stop();
    }
    const routine = new Routine(genFn(), new RecursiveScheduler());
    expect(routine.state).toEqual('PAUSED');
  });

  it('should stop iterating over the generator when the the routine in the PAUSED state', () => {
    let here = false;
    function* genFn() {
      yield stop();
      here = true;
      yield noop();
    }
    const routine = new Routine(genFn(), new RecursiveScheduler());
    expect(routine.state).toEqual('PAUSED');
    expect(here).toBe(false);
  });

  it('should pass a value that is not a known operation back to the generator', () => {
    let result: any;
    function* genFn() {
      result = yield 'NON_OPERATION';
    }
    new Routine(genFn(), new RecursiveScheduler());
    expect(result).toEqual('NON_OPERATION');
  });

  it('should resolve a timeout', () => {
    jest.useFakeTimers();
    let here = false;
    function* genFn() {
      yield sleep(1000);
      here = true;
    }
    const routine = new Routine(genFn(), new RecursiveScheduler());
    expect(routine.state).toEqual('RUNNING');
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    jest.runAllTimers();
    expect(routine.state).toEqual('COMPLETE');
  });

  it('should unwrap resolved promises', async () => {
    let resolve1: (value: string) => void;
    const promise1 = new Promise<string>(resolve => resolve1 = resolve);

    let resolve2: (value: Operation) => void;
    const promise2 = new Promise<Operation>(resolve => resolve2 = resolve);

    let result: any;
    function* genFn() {
      result = yield promise1;
      yield promise2;
    }
    const routine = new Routine(genFn(), new RecursiveScheduler());

    expect(routine.state).toEqual('RUNNING');
    expect(result).toBeUndefined();

    resolve1('SOME VALUE');
    await promise1;
    expect(routine.state).toEqual('RUNNING');
    expect(result).toEqual('SOME VALUE');

    resolve2(stop());
    await promise2;
    expect(routine.state).toEqual('PAUSED');
  });

  it('should unwrap rejected promises', async () => {
    const logs: string[] = [];
    let routine: Routine;
    const log = (msg: string) => logs.push(msg + ' : ' + routine?.state);

    let rejectP1: (error: any) => void;
    const p1 = new Promise<string>((_resolve, reject) => rejectP1 = reject);

    let resolveP2: (value: Operation) => void;
    const p2 = new Promise<Operation>(resolve => resolveP2 = resolve);

    function* genFn() {
      try {
        log('1 start routine');
        yield p1;
        log('should not get here');
      } catch (e) {
        log(`5 start routine catch (${e})`);
        yield p2;
        log('should not get here');
      }
      log('should not get here');
    }
    routine = new Routine(genFn(), new RecursiveScheduler());

    log('2 after new Routine()');

    log('3 before rejecting');
    rejectP1('ERROR');
    log('4 after rejecting');
    try {await p1;} catch {}

    log('6 before resolving');
    resolveP2(stop());
    log('7 after resolving');
    await p2;
    log('8 end');

    expect(logs).toEqual([
      '1 start routine : undefined',
      '2 after new Routine() : RUNNING',
      '3 before rejecting : RUNNING',
      '4 after rejecting : RUNNING',
      '5 start routine catch (ERROR) : RUNNING',
      '6 before resolving : RUNNING',
      '7 after resolving : RUNNING',
      '8 end : PAUSED',
    ]);
  });
});
