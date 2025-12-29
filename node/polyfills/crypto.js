const crypto = globalThis.crypto;

function getRandomBytes() {
  if (crypto?.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function randomUUID() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = getRandomBytes();
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Set version to 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Set variant to RFC 4122

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
}

function concatUint8Arrays(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

function normalizeData(data, encoding) {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  }

  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  throw new TypeError('Data must be a string, Buffer, or ArrayBuffer');
}

class Hash {
  constructor(algorithm) {
    this.algorithm = algorithm;
    this.chunks = [];
  }

  update(data, encoding) {
    const normalized = normalizeData(data, encoding);
    this.chunks.push(normalized);
    return this;
  }

  async digest(encoding) {
    if (!crypto?.subtle?.digest) {
      throw new Error('SubtleCrypto is not available in this environment');
    }

    const input = concatUint8Arrays(this.chunks);
    const algorithm = this.algorithm.toUpperCase().replace('SHA', 'SHA-');
    const result = await crypto.subtle.digest(algorithm, input);
    const bytes = new Uint8Array(result);

    if (!encoding) {
      return bytes;
    }

    if (encoding === 'hex') {
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    if (encoding === 'base64') {
      const binary = String.fromCharCode(...bytes);
      return btoa(binary);
    }

    throw new TypeError(`Unsupported encoding: ${encoding}`);
  }
}

export function createHash(algorithm) {
  return new Hash(algorithm);
}

export default {
  randomUUID,
  createHash,
};
