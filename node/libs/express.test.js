import test from 'node:test';
import assert from 'node:assert';

import express from './express.js';

test('invokes error middleware when next receives an error', async () => {
  const app = express();

  app.use((_req, _res, next) => next(new Error('boom')));
  app.use((err, _req, res, _next) => {
    res.status(500).send(err.message);
  });

  const res = await app.handle();

  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.body, 'boom');
});

test('skips normal handlers while an error is active and resumes once cleared', async () => {
  const app = express();
  const calls = [];

  app.use((_req, _res, next) => {
    calls.push('before-error');
    next(new Error('bad'));
  });

  app.use((err, _req, _res, next) => {
    calls.push(`error:${err.message}`);
    next();
  });

  app.use((_req, _res, next) => {
    calls.push('after-error');
    next();
  });

  app.use((_req, res) => res.send('done'));

  await app.handle();

  assert.deepStrictEqual(calls, ['before-error', 'error:bad', 'after-error']);
});

test('propagates thrown errors to error middleware', async () => {
  const app = express();

  app.get('/fail', () => {
    throw new Error('thrown');
  });

  app.use((err, _req, res, _next) => {
    res.send(`caught:${err.message}`);
  });

  const res = await app.handle({ method: 'GET', path: '/fail' });

  assert.strictEqual(res.body, 'caught:thrown');
});

test('express.text converts body to string form', async () => {
  const app = express();

  app.use(express.text());
  app.post('/txt', (req, res) => {
    res.send(req.body);
  });

  const res = await app.handle({ method: 'POST', path: '/txt', body: Buffer.from('hello') });

  assert.strictEqual(res.body, 'hello');
});

test('express.text populates missing body with empty string', async () => {
  const app = express();

  app.use(express.text());
  app.post('/txt', (req, res) => {
    res.send(req.body === '' ? 'empty' : 'not-empty');
  });

  const res = await app.handle({ method: 'POST', path: '/txt' });

  assert.strictEqual(res.body, 'empty');
});
