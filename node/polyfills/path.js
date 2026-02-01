class Path {
  static sep = '/'

  // Join multiple path segments into one
  static join(...segments) {
    return segments
      .filter(Boolean) // Remove empty segments
      .join('/')
      .replace(/\/+/g, '/'); // Normalize slashes
  }

  // Get the directory name of a path
  static dirname(path) {
    const parts = path.split('/').filter(Boolean);
    parts.pop(); // Remove the last part (file or directory)
    return '/' + parts.join('/');
  }

  // Get the base name of a path
  static basename(path, ext) {
    const base = path.split('/').filter(Boolean).pop() || '';
    if (ext && base.endsWith(ext)) {
      return base.slice(0, -ext.length);
    }
    return base;
  }

  // Get the file extension of a path
  static extname(path) {
    const base = Path.basename(path);
    const dotIndex = base.lastIndexOf('.');
    return dotIndex > 0 ? base.slice(dotIndex) : '';
  }

  // Resolve a sequence of paths into an absolute path
  static resolve(...segments) {
    let resolvedPath = [];
    for (const segment of segments) {
      if (segment.startsWith('/')) {
        resolvedPath = []; // Reset if an absolute path is encountered
      }
      segment.split('/').forEach(part => {
        if (part === '..') {
          resolvedPath.pop(); // Go up one level
        } else if (part !== '.' && part !== '') {
          resolvedPath.push(part); // Add valid parts
        }
      });
    }
    return '/' + resolvedPath.join('/');
  }

  // Normalize a path (remove redundant slashes and resolve `.` and `..`)
  static normalize(path) {
    return Path.resolve(path);
  }

  // Get the relative path from one path to another
  static relative(from, to) {
    const fromPath = Path.resolve(from);
    const toPath = Path.resolve(to);
    console.log(`relative from ${from} to ${to}`)

    if (fromPath === toPath) {
      return '';
    }

    const fromParts = fromPath.split('/').filter(Boolean);
    const toParts = toPath.split('/').filter(Boolean);
    const maxLength = Math.min(fromParts.length, toParts.length);
    let commonIndex = 0;

    while (commonIndex < maxLength && fromParts[commonIndex] === toParts[commonIndex]) {
      commonIndex += 1;
    }

    const upLevels = fromParts.length - commonIndex;
    const relativeParts = [];

    for (let i = 0; i < upLevels; i += 1) {
      relativeParts.push('..');
    }

    relativeParts.push(...toParts.slice(commonIndex));

    return relativeParts.join('/');
  }

  // Parse a path into { root, dir, base, ext, name }
  static parse(path) {
    const root = path.startsWith('/') ? '/' : '';
    const parts = path.split('/').filter(Boolean);
    const base = parts.pop() || '';
    const dir = root + parts.join('/');
    const ext = Path.extname(base);
    const name = ext ? base.slice(0, -ext.length) : base;

    return { root, dir, base, ext, name };
  }

}

export default Path;
