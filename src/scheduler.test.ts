/**
 * @jest-environment node
 */
import {HybridScheduler, NextTickScheduler, RecursiveScheduler, TimeoutScheduler} from './scheduler';

describe('RecursiveScheduler', () => {
  it('should execute the `next()` call in the same stack frame', () => {
    const scheduler = new RecursiveScheduler();
    let count = 5;
    const log = ['before'];
    const nextFn = () => {
      log.push('next ' + count);
      if (--count > 0) scheduler.schedule(nextFn);
    };
    scheduler.schedule(nextFn);
    log.push('after');
    expect(count).toEqual(0);
    expect(log).toEqual(['before', 'next 5', 'next 4', 'next 3', 'next 2', 'next 1', 'after']);
  });
});

describe('TimeoutScheduler', () => {
  it('should execute each `next()` call in a new stack frame triggered by `setTimeout()`', () => {
    jest.useFakeTimers();
    const scheduler = new TimeoutScheduler();
    let count = 5;
    const log = ['before'];
    const nextFn = () => {
      log.push('next ' + count);
      if (--count > 0) scheduler.schedule(nextFn);
    };
    scheduler.schedule(nextFn);
    log.push('after');

    jest.runAllImmediates();
    expect(count).toEqual(5);
    expect(log).toEqual(['before', 'after']);

    jest.runOnlyPendingTimers();
    expect(count).toEqual(4);
    expect(log).toEqual(['before', 'after', 'next 5']);

    jest.runAllTimers();
    expect(count).toEqual(0);
    expect(log).toEqual(['before', 'after', 'next 5', 'next 4', 'next 3', 'next 2', 'next 1']);
  });
});

describe('NextTickScheduler', () => {
  it('should execute each `next()` call in a new stack frame triggered by `setImmediate()`', () => {
    jest.useFakeTimers();
    const scheduler = new NextTickScheduler();
    let count = 5;
    const log = ['before'];
    const nextFn = () => {
      log.push('next ' + count);
      if (--count > 0) scheduler.schedule(nextFn);
    };
    scheduler.schedule(nextFn);
    log.push('after');

    expect(count).toEqual(5);
    expect(log).toEqual(['before', 'after']);

    jest.runOnlyPendingTimers();
    expect(count).toEqual(4);
    expect(log).toEqual(['before', 'after', 'next 5']);

    jest.runAllImmediates();
    expect(count).toEqual(0);
    expect(log).toEqual(['before', 'after', 'next 5', 'next 4', 'next 3', 'next 2', 'next 1']);
  });
});

describe('HybridScheduler', () => {
  it('should recurse `recurseDepth` times and then start a new stack frame', () => {
    jest.useFakeTimers();
    const scheduler = new HybridScheduler(new TimeoutScheduler(), 3);
    let count = 5;
    const log = ['before'];
    const nextFn = () => {
      log.push('next ' + count);
      if (--count > 0) scheduler.schedule(nextFn);
    };
    scheduler.schedule(nextFn);
    log.push('after');

    expect(count).toEqual(2);
    expect(log).toEqual(['before', 'next 5', 'next 4', 'next 3', 'after']);

    jest.runOnlyPendingTimers();
    expect(count).toEqual(0);
    expect(log).toEqual(['before', 'next 5', 'next 4', 'next 3', 'after', 'next 2', 'next 1']);
  });

  it('should default its async scheduler to `NextTickScheduler` and 100 recurseDepth', () => {
    jest.useFakeTimers();
    const scheduler = new HybridScheduler();
    let count = 200;
    const log = ['before'];
    const nextFn = () => {
      if (count % 20 === 0) log.push('next ' + count);
      if (--count > 0) scheduler.schedule(nextFn);
    };
    scheduler.schedule(nextFn);
    log.push('after');

    expect(count).toEqual(100);
    expect(log).toEqual(['before', 'next 200', 'next 180', 'next 160', 'next 140', 'next 120', 'after']);

    jest.runOnlyPendingTimers();
    expect(count).toEqual(0);
    expect(log).toEqual(['before', 'next 200', 'next 180', 'next 160', 'next 140', 'next 120', 'after', 'next 100', 'next 80', 'next 60', 'next 40', 'next 20']);
  });
});
