import {DroppingBuffer, FixedBuffer, SlidingBuffer} from './buffers';

describe('FixedBuffer', () => {
  describe('constructor', () => {
    it('should create an empty Buffer with the given size', () => {
      const buffer = new FixedBuffer(10);
      expect(buffer.size).toEqual(10);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.acceptingItems).toBe(true);
    });
  });

  describe('add()', () => {
    it('should add an item to the buffer', () => {
      const buffer = new FixedBuffer(10);
      buffer.add('item');
      expect(buffer.items.length).toEqual(1);
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.acceptingItems).toBe(true);
    });

    it('should add items to the start of the buffer', () => {
      const buffer = new FixedBuffer(10);
      buffer.add('item 1');
      buffer.add('item 2');
      buffer.add('item 3');
      expect(buffer.items).toEqual(['item 3', 'item 2', 'item 1']);
    });

    it('should throw an error if the buffer is not accepting items', () => {
      const buffer = new FixedBuffer(10);
      for(let i = 0; i < 10; i++) {
        buffer.add('item ' + i);
      }
      expect(buffer.items.length).toEqual(10);
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.acceptingItems).toBe(false);

      expect(() => buffer.add('item 11')).toThrowError('Tried to add an item, but the buffer (of fixed size 10) is full.');
    });
  });

  describe('remove()', () => {
    it('should throw an error if the buffer is empty', () => {
      const buffer = new FixedBuffer(10);
      expect(() => buffer.remove()).toThrowError('Tried to remove an item from an empty buffer');
    });

    it('should remove items from the end of the buffer', () => {
      const buffer = new FixedBuffer(10);
      buffer.add('item 1');
      buffer.add('item 2');
      buffer.add('item 3');
      expect(buffer.items).toEqual(['item 3', 'item 2', 'item 1']);
      expect(buffer.remove()).toEqual('item 1');
      expect(buffer.remove()).toEqual('item 2');
      expect(buffer.items).toEqual(['item 3']);
    });
  });

  describe('isEmpty', () => {
    it('should return true if and only if there are no items in the buffer', () => {
      const buffer = new FixedBuffer(10);
      expect(buffer.isEmpty).toBe(true);
      buffer.add('item');
      expect(buffer.isEmpty).toBe(false);
      buffer.remove();
      expect(buffer.isEmpty).toBe(true);
      buffer.add('item');
      expect(buffer.isEmpty).toBe(false);
    });
  });

  describe('acceptingItems', () => {
    it('should return true if the number of items in the buffer is less than the buffer size', () => {
      const buffer = new FixedBuffer(3);
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(false);
      buffer.remove();
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(false);
    });
  });
});

describe('DroppingBuffer', () => {
  describe('constructor', () => {
    it('should create an empty Buffer with the given size', () => {
      const buffer = new DroppingBuffer(10);
      expect(buffer.size).toEqual(10);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.acceptingItems).toBe(true);
    });
  });

  describe('add()', () => {
    it('should add an item to the buffer', () => {
      const buffer = new DroppingBuffer(10);
      buffer.add('item');
      expect(buffer.items.length).toEqual(1);
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.acceptingItems).toBe(true);
    });

    it('should add items to the start of the buffer', () => {
      const buffer = new DroppingBuffer(10);
      buffer.add('item 1');
      buffer.add('item 2');
      buffer.add('item 3');
      expect(buffer.items).toEqual(['item 3', 'item 2', 'item 1']);
    });

    it('should drop the item if the buffer is full', () => {
      const buffer = new DroppingBuffer(10);
      for(let i = 0; i < 10; i++) {
        buffer.add('item ' + i);
      }
      expect(buffer.items.length).toEqual(10);
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.acceptingItems).toBe(true);

      const dropped = buffer.add('item 11');
      expect(dropped).toEqual('item 11');
    });
  });

  describe('remove()', () => {
    it('should throw an error if the buffer is empty', () => {
      const buffer = new DroppingBuffer(10);
      expect(() => buffer.remove()).toThrowError('Tried to remove an item from an empty buffer');
    });

    it('should remove items from the end of the buffer', () => {
      const buffer = new DroppingBuffer(10);
      buffer.add('item 1');
      buffer.add('item 2');
      buffer.add('item 3');
      expect(buffer.items).toEqual(['item 3', 'item 2', 'item 1']);
      expect(buffer.remove()).toEqual('item 1');
      expect(buffer.remove()).toEqual('item 2');
      expect(buffer.items).toEqual(['item 3']);
    });
  });

  describe('isEmpty', () => {
    it('should return true if and only if there are no items in the buffer', () => {
      const buffer = new DroppingBuffer(10);
      expect(buffer.isEmpty).toBe(true);
      buffer.add('item');
      expect(buffer.isEmpty).toBe(false);
      buffer.remove();
      expect(buffer.isEmpty).toBe(true);
      buffer.add('item');
      expect(buffer.isEmpty).toBe(false);
    });
  });

  describe('acceptingItems', () => {
    it('should always return true', () => {
      const buffer = new DroppingBuffer(3);
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
      buffer.remove();
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
    });
  });
});

describe('SlidingBuffer', () => {
  describe('constructor', () => {
    it('should create an empty Buffer with the given size', () => {
      const buffer = new SlidingBuffer(10);
      expect(buffer.size).toEqual(10);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.acceptingItems).toBe(true);
    });
  });

  describe('add()', () => {
    it('should add an item to the buffer', () => {
      const buffer = new SlidingBuffer(10);
      buffer.add('item');
      expect(buffer.items.length).toEqual(1);
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.acceptingItems).toBe(true);
    });

    it('should add items to the start of the buffer', () => {
      const buffer = new SlidingBuffer(10);
      buffer.add('item 1');
      buffer.add('item 2');
      buffer.add('item 3');
      expect(buffer.items).toEqual(['item 3', 'item 2', 'item 1']);
    });

    it('should drop the oldest item in the buffer if it is full', () => {
      const buffer = new SlidingBuffer(10);
      for(let i = 0; i < 10; i++) {
        buffer.add('item ' + i);
      }
      expect(buffer.items.length).toEqual(10);
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.acceptingItems).toBe(true);

      const dropped = buffer.add('item 11');
      expect(dropped).toEqual('item 0');
    });
  });

  describe('remove()', () => {
    it('should throw an error if the buffer is empty', () => {
      const buffer = new SlidingBuffer(10);
      expect(() => buffer.remove()).toThrowError('Tried to remove an item from an empty buffer');
    });

    it('should remove items from the end of the buffer', () => {
      const buffer = new SlidingBuffer(10);
      buffer.add('item 1');
      buffer.add('item 2');
      buffer.add('item 3');
      expect(buffer.items).toEqual(['item 3', 'item 2', 'item 1']);
      expect(buffer.remove()).toEqual('item 1');
      expect(buffer.remove()).toEqual('item 2');
      expect(buffer.items).toEqual(['item 3']);
    });
  });

  describe('isEmpty', () => {
    it('should return true if and only if there are no items in the buffer', () => {
      const buffer = new SlidingBuffer(10);
      expect(buffer.isEmpty).toBe(true);
      buffer.add('item');
      expect(buffer.isEmpty).toBe(false);
      buffer.remove();
      expect(buffer.isEmpty).toBe(true);
      buffer.add('item');
      expect(buffer.isEmpty).toBe(false);
    });
  });

  describe('acceptingItems', () => {
    it('should always return true', () => {
      const buffer = new SlidingBuffer(3);
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
      buffer.remove();
      expect(buffer.acceptingItems).toBe(true);
      buffer.add('item');
      expect(buffer.acceptingItems).toBe(true);
    });
  });
});
