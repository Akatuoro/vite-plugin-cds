// Preload whatever you want
const modules = {
    // <placeholder>
}

globalThis.modules = modules;

const paths = Object.keys(modules);

modules.resolve = (p) => {
  if (modules[p]) return p;
  if (modules[p + '.js']) return p + '.js';

  // TODO: proper paths relative to root directory
  let full = paths.filter(p2 => p2.endsWith(p))[0];
  if (full) return full;
}
