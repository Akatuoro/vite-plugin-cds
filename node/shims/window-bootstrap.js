(function () {
  var g = (typeof globalThis !== 'undefined') ? globalThis : window;
  var proc = g.process || {};
  proc.env = Object.assign({}, proc.env || {}, g.__ENV__ || {});
  proc.cwd = () => null;
  g.process = proc;
  proc.stdout ??= {}
  proc.stderr ??= {}
  proc.stdin ??= {}
  proc.argv ??= ['<unknown>']

  g.global ??= globalThis
  g.__filename = '<unknown>'
  g.__dirname = '<unknown>'
  g.require = (path) => {
    console.log('require', path);
    return g.modules?.[path];
  }
  g.require.resolve = (path) => {
    console.log('require.resolve', path);
    return path;
  }
})()
