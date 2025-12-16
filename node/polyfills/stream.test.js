import test from 'node:test';
import assert from 'node:assert';

import { Readable, Transform, pipeline } from './stream.js';

test('Readable pushes data and signals end', () => {
  const readable = new Readable();
  const chunks = [];
  let ended = false;

  readable.on('data', (chunk) => chunks.push(chunk));
  readable.on('end', () => {
    ended = true;
  });

  readable.push('a');
  readable.push('b');
  readable.push(null);

  assert.deepStrictEqual(chunks, ['a', 'b']);
  assert.strictEqual(ended, true);
});

test('Transform applies mapping before piping to destination', async () => {
  const upper = new Transform({
    transform(chunk) {
      this.push(String(chunk).toUpperCase());
    }
  });

  const results = [];
  const destination = {
    write(chunk) {
      results.push(chunk);
    },
    end() {
      results.push('done');
    }
  };

  upper.pipe(destination);

  await upper.write('hello');
  await upper.write('world');
  await upper.end();

  assert.deepStrictEqual(results, ['HELLO', 'WORLD', 'done']);
});

test('pipeline resolves when the destination finishes', async () => {
  const source = new Readable();
  const upper = new Transform({
    transform(chunk) {
      this.push(String(chunk).toUpperCase());
    }
  });

  const collected = [];
  const sink = new Transform({
    transform(chunk) {
      collected.push(chunk);
    }
  });

  sink.end = async function end() {
    collected.push('FINISHED');
    await Transform.prototype.end.call(this);
  };

  const promise = pipeline(source, upper, sink);
  source.push('hi');
  source.push('there');
  source.push(null);

  await promise;
  assert.deepStrictEqual(collected, ['HI', 'THERE', 'FINISHED']);
});
