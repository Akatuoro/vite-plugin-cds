(function () {
  var g = (typeof globalThis !== 'undefined') ? globalThis : window;
  var proc = g.process || {};
  proc.env = Object.assign({}, proc.env || {}, g.__ENV__ || {});
  proc.cwd = () => null;
  g.process = proc;

  g.global ??= globalThis
  g.__filename = '<unknown>'
  g.__dirname = '<unknown>'
  g.require = () => {}
  g.require.resolve = () => {}
})()
