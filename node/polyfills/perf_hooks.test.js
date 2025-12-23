import test from 'node:test';
import assert from 'node:assert';

import { performance } from './perf_hooks.js';

test('performance.now returns increasing high-resolution timestamps', async () => {
  const first = performance.now();
  await new Promise((resolve) => setTimeout(resolve, 10));
  const second = performance.now();

  assert.strictEqual(typeof first, 'number');
  assert.ok(second >= first);
});
