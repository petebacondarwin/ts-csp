import {Routine} from './routine';
import {put, take} from './operations';
import {RecursiveScheduler} from './scheduler';
import {Channel} from './channel';

describe('Routines with channels', () => {
  describe('with no buffer', () => {
    it('should synchonize channels via puts and takes', async () => {
      const log: string[] = [];
      const ch = new Channel<string>();

      function* readerFn() {
        while(true) {
          log.push('taking ' + (yield take(ch)));
        }
      }
      const readerRoutine = new Routine(readerFn(), new RecursiveScheduler());

      function* writerFn() {
        log.push('putting item 1');
        yield put(ch, 'item 1');
        log.push('putting item 2');
        yield put(ch, 'item 2');
      }
      const writerRoutine = new Routine(writerFn(), new RecursiveScheduler());

      await writerRoutine.completed;
      expect(writerRoutine.state).toEqual('COMPLETE');
      // The reader routine never completes
      expect(readerRoutine.state).toEqual('RUNNING');
      expect(log).toEqual([
        'putting item 1',
        'taking item 1',
        'putting item 2',
        'taking item 2',
      ]);
    });
  });
});