import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { capESBuild } from './esbuild.js';
import { insertFileDir, preloadModules, resolve, cdsEnv } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const noop = path.join(__dirname, '../node/shims/noop.js');

const ccds = path.dirname(resolve('@sap/cds'));

const isPathInside = (p, dir) => {
  if (!dir) return false;
  const relative = path.relative(dir, p);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};


const dynamicRequireRoot = path.relative(process.cwd(), path.join(ccds, '../../../../'));

const resolveDynReqTarget = (p) => {
  const resolved = resolve(p);
  let root = dynamicRequireRoot;
  if (!dynamicRequireRoot.endsWith('/')) root += '/';
  const relFromRoot = path.relative(dynamicRequireRoot, resolved);

  return dynamicRequireRoot + relFromRoot;
}

const rewriteRolldownReservedClassNames = (code) => {
  // oxc (used by rolldown in Vite 8) rejects some identifier names in class declarations
  return code
    // class declarations: keep the identifier binding, drop the class name.
    .replace(/^(\s*)class\s+(any|string|boolean|number)\b([^\{]*)\{/gm, '$1const $2 = class$3{ static get name() { return "$2" };')
    // class expressions: `const X = class any {}` -> anonymous class expression.
    .replace(/=(\s*)class\s+(any|string|boolean|number)\b([^\{]*)\{/g, '=$1class$3{ static get name() { return "$2" };');
};

const toCommonJS = `
export var __toCommonJS = (mod) =>
  __hasOwnProp.call(mod, \'module.exports\')
    ? mod[\'module.exports\']
    : __copyProps(__defProp(mod.default ?? {}, \'__esModule\', { value: true }), mod);
`;

export function capVite() {
  return {
    name: 'cap',
    enforce: 'pre',

    async transform(code, id) {
      // === modify vite / rolldown code for commonJS compat ===
      if (id.includes('rolldown/runtime.js')) {
        code = code.replace('export var __toCommonJS', toCommonJS + 'var __toCommonJSOld')
        return { code }
      }
      // ======

      if (id.includes('/@sap/cds/lib/index.js')) {
        code = code.replace(
          /get test\(\) \{ return super\.test = require\('.*?cds-test\.js'\) \}/,
          'get test() { return super.test = {} }',
        );
      }
      if (id.includes('/@sap/cds/lib/srv/middlewares/trace.js')) {
        code = code.replaceAll(/_instrument_.*\([^\)]+\);/g, '');
      }
      if (id.includes('/@sap/cds/lib/utils/cds-utils.js')) {
        code = code.replaceAll(/\bimport\s*?\((.*?pathToFileURL.*?)\)/g, 'import(/* @vite-ignore */ $1)')
        code = code.replaceAll(/\bimport\s*?\(id\)/g,                    'import(/* @vite-ignore */ id)')
      }
      if (id.includes('lib/i18n/index.js')) {
        code = code.replaceAll('super', 'this');
        return { code, map: null };
      }
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

      if (id.includes('SQLiteService.js')) {
        // import via strings, not variables
        code = code.replace(`require(drivers['better-sqlite3'])`, "require('better-sqlite3')");
        return { code };
      }

      if (isPathInside(id, ccds)) {
        code = rewriteRolldownReservedClassNames(code);

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
      if (id.includes('cds-test')) {
        if (/cds-test(\.js)?$/.test(id)) return noop;
        const resolved = resolve(id, importer);
        if (
          resolved === path.join(ccds, 'lib/test/cds-test.js') ||
          resolved === path.join(ccds, 'lib/test/cds-test')
        ) {
          return noop;
        }
      }
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
        const env = cdsEnv();
        return 'export default ' + JSON.stringify(env);
      };
      if (id.includes('cds-test') && /cds-test(\.js)?$/.test(id)) {
        return 'export default {}';
      }

      if (id === path.join(__dirname, 'shims/preload-modules.js')) {
        const code = fs.readFileSync(id, 'utf8');
        return preloadModules(code, id);
      }
      return null;
    },

    config(config) {
      const _manualChunks = config?.build?.rollupOptions?.output?.manualChunks
      const { rolldownVersion } = this.meta ?? {}
      return {
        optimizeDeps: rolldownVersion? {
          include: ['cjs-package', '@sap/cds', '@sap/cds-compiler'],
        } : {
          include: [ '@sap/cds', '@sap/cds-compiler', '@cap-js/sqlite' ],
          esbuildOptions: {
            plugins: [capESBuild()],
            keepNames: true,
          },
        },
        esbuild: rolldownVersion? undefined : {
          // necessary because cap coding relies on reflection:
          keepNames: true,
        },
        build: {

          commonjsOptions: {
            dynamicRequireTargets: [
              '@sap/cds/lib/srv/protocols/odata-v4',
              '@sap/cds/lib/srv/factory',
              '@sap/cds/srv/app-service.js',
              '@sap/cds/lib/env/defaults',
              '@sap/cds/lib/*.js',
              '@cap-js/sqlite',
            ].map(resolveDynReqTarget),
            dynamicRequireRoot,
            ignoreDynamicRequires: true,
            requireReturnsDefault: "preferred",
            include: [/node_modules/, /cap/, /node/, '*.js']
          },
          chunkSizeWarningLimit: 1500,
          rollupOptions: {
            output: {
              manualChunks: (id, api) => {
                const match = (...paths) => paths.some(p => id.includes(p))
                if (match('@sap/cds-compiler/')) return 'cdsc'
                if (match('@sap/cds/', '@cap-js/db-service/', '@cap-js/sqlite/', 'generic-pool/', 'virtual:cds-env', 'vite-plugin-cds/cap/', '__vite-optional-peer-dep:tar:@sap/cds:true', 'js-yaml/')) return 'cds'
                return _manualChunks?.(id, api) ?? null
              }
            },
          },
        },
        resolve: {
          alias: [
            { find: /^.*cds-test(\.js)?$/, replacement: noop },
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
