
/**
 * Converts a callback-based function to a Promise-based one.
 * @param {Function} func - The callback-based function.
 * @returns {Function} - A Promise-based version of the function.
 */
export function promisify(func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      func(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}

/**
 * Converts a Promise-based function to a callback-based one.
 * @param {Function} func - The Promise-based function.
 * @returns {Function} - A callback-based version of the function.
 */
export function callbackify(func) {
  return function (...args) {
    const callback = args.pop();
    func(...args)
      .then((result) => callback(null, result))
      .catch((err) => callback(err));
  };
}

export function inspect(value) {
  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

inspect.custom = Symbol('inspect.custom');

/**
 * Inherits the prototype methods from one constructor into another.
 * @param {Function} ctor - The constructor that will inherit.
 * @param {Function} superCtor - The constructor to inherit from.
 */
export function inherits(ctor, superCtor) {
  if (typeof superCtor !== 'function' && typeof superCtor !== 'object' && superCtor !== null) {
    throw new TypeError('The super constructor must be a function, object, or null', ctor, superCtor);
  }
  ctor.super_ = superCtor;
  if (superCtor) {
    if (typeof superCtor === 'object') Object.setPrototypeOf(ctor.prototype, Object.getPrototypeOf(superCtor))
    else Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  }
}

/**
 * Formats a string with placeholders (similar to printf).
 * @param {string} format - The format string.
 * @param {...any} args - The values to replace placeholders.
 * @returns {string} - The formatted string.
 */
export function format(format, ...args) {
  if (typeof format !== 'string') return format;
  let i = 0;
  return format.replace(/%[sdj%]/g, (match) => {
    if (match === '%%') return '%';
    if (i >= args.length) return match;
    switch (match) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch {
          return '[Circular]';
        }
      default:
        return match;
    }
  });
}
