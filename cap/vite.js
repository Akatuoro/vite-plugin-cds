import cds from '@sap/cds';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { capESBuild } from './esbuild.js';
import { insertFileDir, preloadModules, resolve } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const noop = path.join(__dirname, 'shims/noop.js');

const ccds = path.dirname(resolve('@sap/cds'));

const isPathInside = (p, dir) => {
  if (!dir) return false;
  const relative = path.relative(dir, p);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};



export function capVite() {
  return {
    name: 'cap',
    enforce: 'pre',

    async transform(code, id) {
      if (id.includes('/@sap/cds-compiler/')) {
        if (code.includes('lazyload(')) {
          // Replace lazyload('pkg') with require('pkg') for string literals only
          code = code
            .replace(/\blazyload\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g, 'require($1$2$1)');

          return { code, map: null };
        }
      }
      if (id.includes('/@sap/cds/lib/test/cds-test.js')) {
        return { code: `module.exports = require ('@cap-js/cds-test')` };
      }


      if (isPathInside(id, ccds)) {
        code = `require("${resolve(__dirname + '/shims/preload-modules.js')}")\n` +
          `require("${resolve(__dirname + '/shims/load-cds-env.js')}")\n` +
          code;

        code = insertFileDir(code, id);

        // Fix cjs / esm interop
        code = code.replace("Object.assign (exports,require('fs'))", "require('fs').default ?? require('fs')");

        return { code, map: null };
      }
    },


    resolveId(id, importer) {
      if (id === 'virtual:cds-env') return id;
      if (id.includes('auth')) {
        const resolved = resolve(id, importer);
        if ( resolved === path.join(ccds, 'srv/middlewares/auth/index.js') ||
             resolved === path.join(ccds, 'srv/middlewares/auth')) {
          return path.join(__dirname, 'polyfills/srv/middlewares/auth/index.js');
        }
      }
      return null;
    },
    load(id) {
      if (id === 'virtual:cds-env') {
        // always use dev environment
        const nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        const { env } = cds;
        delete env.profiles;
        process.env.NODE_ENV = nodeEnv;
        return 'export default ' + JSON.stringify(env);
      };

      if (id === path.join(__dirname, 'shims/preload-modules.js')) {
        const code = fs.readFileSync(id, 'utf8');
        return preloadModules(code, id);
      }
      return null;
    },

    config() {
      return {
        optimizeDeps: {
          include: [ '@sap/cds', '@sap/cds-compiler', '@cap-js/sqlite' ],
          esbuildOptions: {
            plugins: [capESBuild()],
            keepNames: true,
          },
        },
        resolve: {
          alias: [
            { find: '@cap-js/cds-test', replacement: noop },
            { find: 'winston', replacement: noop },
            { find: 'sqlite3', replacement: noop },
            { find: '@sap-cloud-sdk/http-client/package.json', replacement: noop },
            { find: '@sap-cloud-sdk/resilience', replacement: noop },
            { find: '@sap-cloud-sdk/http-client', replacement: noop },
            { find: '@sap-cloud-sdk/core', replacement: noop },
            { find: '@sap-cloud-sdk/connectivity', replacement: noop },
            { find: '@sap/cds/lib/test/cds-test', replacement: noop },
            { find: '@sap/cds/lib/test/cds-test.js', replacement: noop },

            { find: '@sap/cds-compiler/lib/base/lazyload.js', replacement: noop },
            // old reference
            { find: '@sap/cds/libx/_runtime/cds-services/services/utils/compareJson', replacement: noop },
          ]
        }
      };
    },
  };
}
