const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

function hexToBytes(hex) {
  const normalized = hex.trim();
  if (normalized.length % 2 !== 0) {
    throw new TypeError('Invalid hex string');
  }
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export class Buffer extends Uint8Array {
  static from(value, encoding) {
    if (typeof value === 'string') {
      if (encoding === 'hex') {
        return new Buffer(hexToBytes(value));
      }
      return new Buffer(textEncoder.encode(value));
    }

    if (Array.isArray(value)) {
      return new Buffer(value);
    }

    if (value instanceof ArrayBuffer) {
      return new Buffer(new Uint8Array(value));
    }

    if (ArrayBuffer.isView(value)) {
      const view = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      return new Buffer(view);
    }

    throw new TypeError('Unsupported input type for Buffer.from');
  }

  static isBuffer(value) {
    return value instanceof Buffer;
  }

  static concat(list) {
    const totalLength = list.reduce((sum, current) => sum + current.length, 0);
    const result = new Buffer(totalLength);
    let offset = 0;
    for (const item of list) {
      result.set(item, offset);
      offset += item.length;
    }
    return result;
  }

  static alloc(size, fill = 0) {
    const buf = new Buffer(size);
    buf.fill(fill);
    return buf;
  }

  toString(encoding = 'utf-8') {
    if (encoding === 'hex') {
      return bytesToHex(this);
    }
    if (encoding === 'utf-8' || encoding === 'utf8') {
      return textDecoder.decode(this);
    }
    throw new TypeError(`Encoding ${encoding} not supported by mock Buffer`);
  }
}

// Ensure global Buffer is defined when this module is loaded.
globalThis.Buffer = Buffer;

export default Buffer;
