import path from 'path';
import { fileURLToPath } from 'url';

import { capESBuild } from './esbuild.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const noop = path.join(__dirname, 'shims/noop.js');
const virtualNoop = '\0cap:noop';
const capEsbuildOptions = {
  plugins: [capESBuild()],
  keepNames: true,
};

export function capVite() {
  return {
    name: 'cap',
    enforce: 'pre',

    resolveId(source, importer) {
      if (!importer) return null;
      const normalizedImporter = importer.replace(/\\/g, '/');
      if (
        normalizedImporter.includes('/@sap/cds/lib/index.js') &&
        source.endsWith('test/cds-test.js')
      ) {
        return virtualNoop;
      }
      if (source.includes('@sap/cds/lib/test/cds-test')) {
        return noop;
      }
      return null;
    },
    load(id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (id === virtualNoop || normalizedId.includes('/@sap/cds/lib/test/cds-test.js')) {
        return 'export default {}';
      }
      return null;
    },
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (normalizedId.includes('/@sap/cds/lib/index.js')) {
        const updated = code.replace(
          /get test\(\)\s*\{\s*return super\.test\s*=\s*require\(['"]\.\/test\/cds-test\.js['"]\)\s*\}/,
          'get test() { return {}; }',
        );
        if (updated !== code) {
          return {
            code: updated,
            map: null,
          };
        }
      }
      if (normalizedId.includes('/@sap/cds/lib/test/cds-test.js')) {
        return {
          code: 'export default {}',
          map: null,
        };
      }
      return null;
    },

    config() {
      return {
        optimizeDeps: {
          include: [ '@sap/cds', '@sap/cds-compiler', '@cap-js/sqlite' ],
          esbuildOptions: capEsbuildOptions,
        },
        build: {
          commonjsOptions: {
            exclude: [/node_modules\/@sap\/cds\/lib\/test\/cds-test\.js/],
          },
          rollupOptions: {
            external: (id) => id.includes('/@sap/cds/lib/test/cds-test.js'),
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

            // old reference
            { find: '@sap/cds/libx/_runtime/cds-services/services/utils/compareJson', replacement: noop },
          ]
        }
      };
    },
  };
}
