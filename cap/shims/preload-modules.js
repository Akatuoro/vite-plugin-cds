// Preload whatever you want
const modules = {
    '../../node_modules/@sap/cds/lib/srv/protocols/odata-v4': () => require('./../../node_modules/@sap/cds/lib/srv/protocols/odata-v4')
}

globalThis.modules = modules;

export function fakeRequire(id) {
  if (!path) {
    throw new Error(`fakeRequire: no module mapped for "${id}"`);
  }
  // modules[path] is the exports object thanks to eager: true
  return modules[path]();
}
