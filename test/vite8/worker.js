import cds from '@sap/cds';

const ctx = self;
ctx.addEventListener('message', event => {
  const { id, model } = event.data;

  try {
    const result = cds.compile(model);
    ctx.postMessage({ id, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : err;
    ctx.postMessage({ id, error: message });
  }
});
