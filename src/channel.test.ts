import {Channel} from './channel';

describe('Channel', () => {
  describe('[no buffering]', () => {
    describe('put()', () => {
      it('should return a promise that resolves with a pending `take()`', async () => {
        const ch = new Channel<string>();
        let takeValue = '';
        ch.take().then(value => takeValue = value);
        expect(takeValue).toBe(''); // The take has not yet resolved

        await ch.put('test');
        expect(takeValue).toBe('test');
      });

      it('should use the earliest pending `take()`', async () => {
        const ch = new Channel<string>();
        const log: string[] = [];
        ch.take().then(value => log.push('take 1:' + value));
        ch.take().then(value => log.push('take 2:' + value));
        ch.take().then(value => log.push('take 3:' + value));

        await ch.put('put 1');
        expect(log).toEqual(['take 1:put 1']);
        await ch.put('put 2');
        expect(log).toEqual(['take 1:put 1', 'take 2:put 2']);
      });
    });

    describe('take()', () => {
      it('should return a promise that resolves with a pending `put()`', async () => {
        const ch = new Channel<string>();
        let putResolved = false;
        ch.put('test').then(() => putResolved = true);
        expect(putResolved).toBe(false); // The put has not yet resolved

        expect(await ch.take()).toBe('test');
        expect(putResolved).toBe(true);
      });

      it('should use the earliest pending `put()`', async () => {
        const ch = new Channel<string>();

        ch.put('put 1');
        ch.put('put 2');
        ch.put('put 3');

        expect(await ch.take()).toEqual('put 1');
        expect(await ch.take()).toEqual('put 2');
      });
    });
  });
});