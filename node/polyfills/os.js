class OS {
  homedir() {
    return '/home';
  }
}

// Export the in-memory path module
const os = new OS();
module.exports = os;
