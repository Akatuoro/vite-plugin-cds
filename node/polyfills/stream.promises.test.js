import test from 'node:test';
import assert from 'node:assert';

import { Readable, Transform } from './stream.js';
import { pipeline, finished } from './stream/promises.js';

test('stream/promises.pipeline returns a promise', async () => {
  const readable = new Readable();
  const transform = new Transform({
    transform(chunk) {
      this.push(String(chunk).toUpperCase());
    }
  });

  const results = [];
  const sink = new Transform({
    transform(chunk) {
      results.push(chunk);
    }
  });

  sink.end = async function end() {
    results.push('done');
    await Transform.prototype.end.call(this);
  };

  const promise = pipeline(readable, transform, sink);
  readable.push('abc');
  readable.push('xyz');
  readable.push(null);
  await promise;

  assert.deepStrictEqual(results, ['ABC', 'XYZ', 'done']);
});

test('stream/promises.finished resolves on end', async () => {
  const readable = new Readable();
  const done = finished(readable);
  readable.push(null);
  await assert.doesNotReject(done);
});

test('stream/promises.finished rejects on error', async () => {
  const readable = new Readable();
  const done = finished(readable);
  const error = new Error('boom');
  readable.emit('error', error);
  await assert.rejects(done, error);
});
