export abstract class Buffer<T> {
  constructor(readonly size: number) {}

  readonly items: T[] = [];

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  abstract get acceptingItems(): boolean;

  add(item: T): T|undefined {
    if (this.items.length < this.size) {
      this.items.unshift(item);
    } else {
      return this.handleOverflow(item);
    }
  }

  remove(): T {
    if (this.isEmpty) {
      throw new Error('Tried to remove an item from an empty buffer');
    }
    return this.items.pop();
  }

  protected abstract handleOverflow(item: T): T|undefined;
}

export class FixedBuffer<T> extends Buffer<T> {
  get acceptingItems(): boolean {
    return this.items.length < this.size;
  }

  protected handleOverflow(_item: T): T|undefined {
    throw new Error(`Tried to add an item, but the buffer (of fixed size ${this.size}) is full.`);
  }
}

export class DroppingBuffer<T> extends Buffer<T> {
  get acceptingItems() {
    return true;
  }

  protected handleOverflow(item: T): T|undefined {
    return item;
  }
}

export class SlidingBuffer<T> extends Buffer<T> {
  get acceptingItems() {
    return true;
  }

  protected handleOverflow(item: T): T|undefined {
    const itemToDrop = this.items.pop();
    this.items.unshift(item);
    return itemToDrop;
  }
}
