import {Routine} from "./routine";
import {RecursiveScheduler} from "./scheduler";

export function run<T, TReturn, TNext>(generatorFn: (...args: any) => Generator<T, TReturn, TNext>, ...args: any[]): Routine<T, TReturn, TNext> {
  return new Routine(generatorFn(args), new RecursiveScheduler());
}
