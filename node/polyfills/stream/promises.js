import { pipeline as basePipeline } from '../stream.js';

function addListener(target, event, listener) {
  if (typeof target?.on === 'function') target.on(event, listener);
  else if (typeof target?.addEventListener === 'function') target.addEventListener(event, listener);
  else if (typeof target?.addListener === 'function') target.addListener(event, listener);
}

function removeListener(target, event, listener) {
  if (typeof target?.off === 'function') target.off(event, listener);
  else if (typeof target?.removeEventListener === 'function') target.removeEventListener(event, listener);
  else if (typeof target?.removeListener === 'function') target.removeListener(event, listener);
}

export function finished(stream, { readable = true, writable = true } = {}) {
  return new Promise((resolve, reject) => {
    const cleanup = (cb, arg) => {
      ['end', 'finish', 'close', 'error'].forEach((event) => removeListener(stream, event, handlers[event]));
      cb?.(arg);
    };

    const handlers = {
      error: (err) => cleanup(reject, err),
      end: () => readable && cleanup(resolve),
      finish: () => writable && cleanup(resolve),
      close: () => cleanup(resolve)
    };

    ['end', 'finish', 'close', 'error'].forEach((event) => addListener(stream, event, handlers[event]));
  });
}

export function pipeline(...streams) {
  if (typeof streams[streams.length - 1] === 'function') {
    throw new TypeError('stream/promises pipeline does not take a callback');
  }
  return basePipeline(...streams);
}

export default { pipeline, finished };
