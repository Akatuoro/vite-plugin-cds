class OS {
  homedir() {
    return '/home';
  }
}

// Export the in-memory path module
const os = new OS();
export default os;

export { os as 'module.exports' }
