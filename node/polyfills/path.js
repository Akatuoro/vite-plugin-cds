class Path {
  // Join multiple path segments into one
  join(...segments) {
    return segments
      .filter(Boolean) // Remove empty segments
      .join('/')
      .replace(/\/+/g, '/'); // Normalize slashes
  }

  // Get the directory name of a path
  dirname(path) {
    const parts = path.split('/').filter(Boolean);
    parts.pop(); // Remove the last part (file or directory)
    return '/' + parts.join('/');
  }

  // Get the base name of a path
  basename(path, ext) {
    const base = path.split('/').filter(Boolean).pop() || '';
    if (ext && base.endsWith(ext)) {
      return base.slice(0, -ext.length);
    }
    return base;
  }

  // Get the file extension of a path
  extname(path) {
    const base = this.basename(path);
    const dotIndex = base.lastIndexOf('.');
    return dotIndex > 0 ? base.slice(dotIndex) : '';
  }

  // Resolve a sequence of paths into an absolute path
  resolve(...segments) {
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
  normalize(path) {
    return this.resolve(path);
  }
}

// Export the in-memory path module
const path = new Path();
module.exports = path;
