import path from 'path';
import { fileURLToPath } from 'url';

import { capESBuild } from './esbuild.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const noop = path.join(__dirname, 'shims/noop.js');

export function capVite() {
  return {
    name: 'cap',

    config() {
      return {
        optimizeDeps: {
          include: [ '@sap/cds', '@sap/cds-compiler', '@cap-js/sqlite' ],
          esbuildOptions: {
            plugins: [capESBuild()],
            keepNames: true
          },
        },
        resolve: {
          alias: {
            '@cap-js/cds-test': noop,
            'winston': noop,
            'sqlite3': noop,
            '@sap-cloud-sdk/http-client/package.json': noop,
            '@sap-cloud-sdk/resilience': noop,
            '@sap-cloud-sdk/http-client': noop,
            '@sap-cloud-sdk/core': noop,
            '@sap-cloud-sdk/connectivity': noop,

            // old reference
            '@sap/cds/libx/_runtime/cds-services/services/utils/compareJson': noop,
          }
        }
      };
    },
  };
}
