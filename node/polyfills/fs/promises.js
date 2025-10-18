import fs from './index.js';

class InMemoryFSPromises {
  // Write a file
  writeFile(path, content) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, content, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Read a file
  readFile(path, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
      fs.readFile(path, encoding, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  // Delete a file
  unlink(path) {
    return new Promise((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // List files in a directory
  readdir(path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }

  // Check if a file exists (returns true/false instead of throwing an error)
  access(path) {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(path)) {
        resolve();
      } else {
        reject(new Error(`ENOENT: no such file or directory, access '${path}'`));
      }
    });
  }
}

// Export the promise-based fs
const fsPromises = new InMemoryFSPromises();
export default fsPromises;