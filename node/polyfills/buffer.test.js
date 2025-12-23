import test from 'node:test';
import assert from 'node:assert';

import Buffer from './buffer.js';

test('Buffer.from creates buffers from strings and hex', () => {
  const utf8 = Buffer.from('hello');
  assert.strictEqual(utf8.toString(), 'hello');

  const hex = Buffer.from('6869', 'hex');
  assert.strictEqual(hex.toString('hex'), '6869');
});

test('Buffer.concat joins buffers', () => {
  const combined = Buffer.concat([Buffer.from('hi '), Buffer.from('there')]);
  assert.strictEqual(combined.toString(), 'hi there');
});

test('Buffer.isBuffer detects mock buffers', () => {
  const buf = Buffer.from('ok');
  assert.ok(Buffer.isBuffer(buf));
  assert.ok(!Buffer.isBuffer('ok'));
});
