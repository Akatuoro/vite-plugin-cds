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
    const resolved = g.modules?.resolve(path) ?? path;
    console.log('require:', resolved, path);
    return g.modules?.[resolved]?.() ?? g.fs?.readFileSync(resolved);
  }
  g.require.resolve = (path) => {
    const resolved = g.modules?.resolve(path) ?? path;
    console.log('require.resolve', resolved, path);
    if (!modules?.[resolved] && !g.fs?.existsSync(path)) {
      const e = new Error(`Path ${path} not found`);
      e.code = 'MODULE_NOT_FOUND';
      throw e;
    } 
    return resolved;
  }
})()
