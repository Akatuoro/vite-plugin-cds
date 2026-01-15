class EventedStream extends EventTarget {
  on(event, listener) {
    const wrapped = (evt) => listener(...(evt.detail ?? []));
    this.addEventListener(event, wrapped);
    return wrapped;
  }

  off(event, listener) {
    this.removeEventListener(event, listener);
  }

  once(event, listener) {
    const wrapped = (evt) => listener(...(evt.detail ?? []));
    this.addEventListener(event, wrapped, { once: true });
    return wrapped;
  }

  emit(event, ...args) {
    const evt = new CustomEvent(event, { detail: args });
    this.dispatchEvent(evt);
    return !evt.defaultPrevented;
  }
}

export class Readable extends EventedStream {
  constructor(options = {}) {
    super();
    this._buffer = [];
    this._read = options.read;
    this.readable = true;
    this.destroyed = false;
  }

  static from(iterable, options = {}) {
    const readable = new Readable(options);

    (async () => {
      try {
        for await (const chunk of iterable ?? []) {
          readable.push(chunk);
        }
        readable.push(null);
      } catch (error) {
        readable.emit('error', error);
        readable.push(null);
      }
    })();

    return readable;
  }

  read() {
    if (this._buffer.length === 0 && typeof this._read === 'function') {
      this._read();
    }
    return this._buffer.shift() ?? null;
  }

  push(chunk) {
    if (this.destroyed) return false;
    if (chunk === null) {
      this.readable = false;
      this.emit('end');
      this.emit('close');
      return false;
    }

    this._buffer.push(chunk);
    this.emit('data', chunk);
    return true;
  }

  pipe(destination) {
    this.on('data', (chunk) => {
      if (typeof destination.write === 'function') destination.write(chunk);
      else if (typeof destination.push === 'function') destination.push(chunk);
    });
    this.on('end', () => {
      if (typeof destination.end === 'function') destination.end();
    });
    return destination;
  }

  async *[Symbol.asyncIterator]() {
    const queue = [];
    let ended = false;

    const dataListener = this.on('data', (chunk) => queue.push(chunk));
    const endListener = this.on('end', () => {
      ended = true;
    });

    try {
      while (!ended || queue.length > 0) {
        if (queue.length === 0) {
          await new Promise((resolve) => this.once('data', resolve));
          continue;
        }
        yield queue.shift();
      }
    } finally {
      this.off('data', dataListener);
      this.off('end', endListener);
    }
  }
}

export class Transform extends Readable {
  constructor(options = {}) {
    super(options);
    this.transform = options.transform;
    this.writable = true;
  }

  async write(chunk, _encoding, callback) {
    if (this.destroyed) return false;
    if (typeof this.transform === 'function') {
      const result = await this.transform.call(this, chunk, (value) => this.push(value));
      if (result !== undefined) this.push(result);
    } else {
      this.push(chunk);
    }
    if (typeof callback === 'function') callback();
    return true;
  }

  async end(chunk) {
    if (chunk !== undefined && chunk !== null) {
      await this.write(chunk);
    }
    this.push(null);
  }
}

export function pipeline(...streams) {
  if (streams.length === 0) throw new Error('Pipeline requires at least one stream');

  const callback = typeof streams[streams.length - 1] === 'function' ? streams.pop() : null;
  const destinations = streams.slice(1);
  const completionTarget = streams[streams.length - 1];

  for (let i = 0; i < streams.length - 1; i += 1) {
    const current = streams[i];
    const next = streams[i + 1];
    if (current && typeof current.pipe === 'function') {
      current.pipe(next);
    }
  }

  const endEvents = ['end', 'finish', 'close'];
  const listeners = new Map();

  const promise = new Promise((resolve, reject) => {
    const cleanup = () => {
      listeners.forEach((listener, target) => {
        endEvents.concat('error').forEach((event) => {
          if (typeof target?.off === 'function') target.off(event, listener[event]);
          else if (typeof target?.removeListener === 'function') target.removeListener(event, listener[event]);
          else if (typeof target?.removeEventListener === 'function') target.removeEventListener(event, listener[event]);
        });
      });
      listeners.clear();
    };

    const onResolve = () => {
      cleanup();
      resolve();
    };

    const onReject = (err) => {
      cleanup();
      reject(err);
    };

    streams.forEach((stream) => {
      const handler = {};
      handler.error = (err) => onReject(err);
      handler.finish = () => stream === completionTarget && onResolve();
      handler.end = () => stream === completionTarget && onResolve();
      handler.close = () => stream === completionTarget && onResolve();

      endEvents.concat('error').forEach((event) => {
        const listener = handler[event];
        if (typeof stream?.on === 'function') stream.on(event, listener);
        else if (typeof stream?.addListener === 'function') stream.addListener(event, listener);
        else if (typeof stream?.addEventListener === 'function') stream.addEventListener(event, listener);
      });

      listeners.set(stream, handler);
    });
  });

  if (callback) {
    promise.then(() => callback()).catch((err) => callback(err));
    return streams[streams.length - 1];
  }

  return promise;
}

export default { Readable, Transform, pipeline };
