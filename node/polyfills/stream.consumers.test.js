import test from 'node:test';
import assert from 'node:assert';

import { Readable } from './stream.js';
import { buffer, text, json, arrayBuffer } from './stream/consumers.js';

test('stream/consumers.buffer collects all chunks', async () => {
  const readable = new Readable();
  const promise = buffer(readable);
  readable.push('hello ');
  readable.push(Buffer.from('world'));
  readable.push(null);
  const buf = await promise;
  assert.strictEqual(buf.toString(), 'hello world');
});

test('stream/consumers.text decodes utf-8', async () => {
  const readable = new Readable();
  const promise = text(readable);
  readable.push(Buffer.from('6869', 'hex'));
  readable.push(null);
  assert.strictEqual(await promise, 'hi');
});

test('stream/consumers.json parses accumulated text', async () => {
  const readable = new Readable();
  const promise = json(readable);
  readable.push('{"value":');
  readable.push('42}');
  readable.push(null);
  const result = await promise;
  assert.deepStrictEqual(result, { value: 42 });
});

test('stream/consumers.arrayBuffer returns ArrayBuffer view', async () => {
  const readable = new Readable();
  const promise = arrayBuffer(readable);
  readable.push(Buffer.from([1, 2, 3]));
  readable.push(null);
  const result = await promise;
  assert.ok(result instanceof ArrayBuffer);
  assert.deepStrictEqual([...new Uint8Array(result)], [1, 2, 3]);
});
