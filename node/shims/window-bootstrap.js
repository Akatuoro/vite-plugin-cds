(function () {
  var g = (typeof globalThis !== 'undefined') ? globalThis : window;
  var proc = g.process || {};
  proc.env = Object.assign({}, proc.env || {}, g.__ENV__ || {});
  proc.cwd = () => '/home';
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
    console.debug('require', resolved, path);
    try {
      return g.modules?.[resolved]?.() ?? g.fs?.readFileSync(resolved);
    }
    catch (cause) {
      const e = new Error(`Module ${path} not found`, { cause });
      e.code = 'MODULE_NOT_FOUND';
      throw e;
    }
  }
  g.require.resolve = (path) => {
    const resolved = g.modules?.resolve(path) ?? path;
    console.debug('require.resolve', resolved, path);
    if (!g.modules?.[resolved] && !g.fs?.existsSync(path)) {
      const e = new Error(`Path ${path} not found`);
      e.code = 'MODULE_NOT_FOUND';
      throw e;
    } 
    return resolved;
  }

  return function(cb) { return cb }
})()
