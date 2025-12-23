import Buffer from '../buffer.js';

async function collect(readable) {
  if (!readable || typeof readable[Symbol.asyncIterator] !== 'function') {
    throw new TypeError('Provided value is not an async iterable stream');
  }

  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return chunks;
}

export async function buffer(readable) {
  const chunks = await collect(readable);
  const buffers = chunks.map((chunk) => {
    if (Buffer.isBuffer(chunk)) return chunk;
    if (typeof chunk === 'string') return Buffer.from(chunk);
    if (chunk instanceof ArrayBuffer) return Buffer.from(chunk);
    if (ArrayBuffer.isView(chunk)) return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    return Buffer.from(String(chunk));
  });
  return Buffer.concat(buffers);
}

export async function text(readable) {
  const buf = await buffer(readable);
  return buf.toString('utf-8');
}

export async function json(readable) {
  const txt = await text(readable);
  return JSON.parse(txt);
}

export async function arrayBuffer(readable) {
  const buf = await buffer(readable);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export default { buffer, text, json, arrayBuffer };
