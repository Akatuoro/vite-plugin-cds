export class InMemoryFS {
  constructor() {
    this.files = {};
  }

  // Write a file
  writeFile(path, content, callback) {
    this.files[path] = content;
    if (callback) callback(null);
  }

  // Write a file synchronously
  writeFileSync(path, content) {
    this.files[path] = content;
  }

  // Read a file
  readFile(path, encoding, callback) {
    if (!this.files[path]) {
      if (callback) callback(new Error(`ENOENT: no such file or directory, open '${path}'`));
      return;
    }
    if (callback) callback(null, this.files[path]);
  }

  // Read a file synchronously
  readFileSync(path) {
    if (!this.files[path]) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    }
    return this.files[path];
  }

  // Check if a file exists
  existsSync(path) {
    return this.files.hasOwnProperty(path);
  }

  // Delete a file
  unlink(path, callback) {
    if (!this.files[path]) {
      if (callback) callback(new Error(`ENOENT: no such file or directory, unlink '${path}'`));
      return;
    }
    delete this.files[path];
    if (callback) callback(null);
  }

  // Delete a file synchronously
  unlinkSync(path) {
    if (!this.files[path]) {
      throw new Error(`ENOENT: no such file or directory, unlink '${path}'`);
    }
    delete this.files[path];
  }

  // List files in a directory (basic implementation)
  readdir(path, callback) {
    const files = Object.keys(this.files).filter(file => file.startsWith(path));
    if (callback) callback(null, files);
  }

  // List files in a directory synchronously
  readdirSync(path) {
    return Object.keys(this.files).filter(file => file.startsWith(path));
  }
}

globalThis.fs ??= new InMemoryFS();

// Export the in-memory fs
const fs = globalThis.fs;
export default fs;
