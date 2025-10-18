import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolve = path => fileURLToPath(import.meta.resolve(path));

const ccds = path.dirname(resolve('@sap/cds'));
const ccom1 = path.dirname(resolve('@sap/cds-compiler'));
const ccom2 = path.dirname(resolve('@sap/cds-compiler', { paths: [ccds] }));
const ccoms = [ccom1, ccom2];
const noop = path.join(__dirname, 'shims/noop.js');

const isPathInside = (p, dir) => {
  const relative = path.relative(dir, p);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};


export function capESBuild() {

  const visited = Symbol('visited');
  return {
    name: 'cap-esbuild',

    setup(build) {

      // ========= non-existent reference ========

      build.onResolve({ filter: /auth.js$/ }, async args => {
        if (args.importer.endsWith('@sap/cds/lib/index.js')) {
          return { path: noop };
        }
        return null;
      });

      // ======== invalid super ========
      build.onLoad({ filter: /.*lib\/i18n\/index.js/ }, async args => {
        if (!isPathInside(args.path, ccds)) return;
        let code = await fs.readFile(args.path, 'utf8');
        code = code.replaceAll('super', 'this');
        return { contents: code, loader: 'js' };
      });

      // ======== lazyload ========
      build.onResolve({ filter: /.*lazyload.*/ }, async args => {
        const pluginData = args.pluginData || {};
        if (pluginData[visited]) return; // avoid loops

        pluginData[visited] = true;

        const { resolveDir, importer, kind } = args;
        const resolved = await build.resolve(args.path, {
          resolveDir,
          importer,
          kind,
          pluginData,
        });

        if (ccoms.some(c => resolved.path === path.join(c, 'base/lazyload.js'))) {
          return { path: noop };
        }

        return null;
      });

      build.onLoad({ filter: /\.[cm]?jsx?$/ }, async (args) => {
        let code = await fs.readFile(args.path, 'utf8');
        if (!code.includes('lazyload(')) return; // fast path

        // Simple check whether we're in a cds-compiler
        if (ccoms.every(c => !isPathInside(args.path, c))) return;

        // Replace lazyload('pkg') with require('pkg') for string literals only
        const replaced = code
          .replace(/\blazyload\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g, 'require($1$2$1)');

        if (replaced === code) return; // no changes
        return { contents: replaced, loader: 'js' };
      });

    },
  };
}
