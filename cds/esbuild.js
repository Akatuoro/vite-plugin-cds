import path from 'path';
import cds from '@sap/cds';

// Currently unused - needed?
export function cdsESBuild() {

  const visited = Symbol('visited');
  const files = new Set();

  let modelPromise;

  return {
    name: 'cap-esbuild',

    setup(build) {
      // ======== .cds imports ========
      build.onResolve({ filter: /\.cds$/ }, async args => {
        const pluginData = args.pluginData || {};
        if (pluginData[visited]) return; // avoid loops


        const resolved = path.resolve(args.resolveDir, args.path);
        files.add(resolved);

        return {
          path: resolved,
          namespace: 'cds'
        };
      });

      build.onLoad({ filter: /\.cds$/, namespace: 'cds' }, async (args) => {

        if (!modelPromise) {
          modelPromise = cds.load([...files.values()]);
        }

        const model = await modelPromise;

        return {
          contents: `export default ${JSON.stringify(model)};`,
          loader: 'js',
          // contents: JSON.stringify(model),
          // loader: 'json',
          watchFiles: [...files],
        };
      });

    },
  };
}
