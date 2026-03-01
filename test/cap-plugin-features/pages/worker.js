import cds from '@sap/cds';

const ctx = self
ctx.addEventListener("message", event => {
  const { id, model } = event.data;

  try {
    const result = cds.compile(model);
    const response = { id, result };
    ctx.postMessage(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : err;
    const response = { id, error: message };
    ctx.postMessage(response);
  }
});
