import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const { fromEntries } = Object;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolve = path => fileURLToPath(import.meta.resolve(path));

/**
 * Vite plugin that polyfills Node.js built-ins.
 * It is very basic -> consider others for a more complete solution.
 *
 * @returns {import('vite').Plugin} Vite plugin object
 */
export function nodeVite(options) {
  const windowBootstrap = fs.readFileSync(path.resolve(__dirname, 'shims/window-bootstrap.js'), 'utf-8');

  const nodeMocks = fromEntries([
    'events', 'fs', 'fs/promises', 'path', 'os', 'async_hooks', 'util', 'stream', 'stream/consumers', 'stream/promises', 'buffer', 'crypto', 'perf_hooks',
  ].map( m => [m, options[m] ?? resolve(path.join(__dirname, 'polyfills', m))] )
    .flatMap(([k, v]) => [[k, v], ['node:' + k, v]]))

  // Explicit noop modules to avoid vite warnings
  // Currently not needed, but may be required in future
  const unsupported = fromEntries([
    'module', 'cluster', 'url', 'querystring', 'http', '_http_common', 'child_process', 'worker_threads', 'readline', 'assert'
  ].map( m => [m, options[m] ?? resolve(path.join(__dirname, 'shims/noop'))] )
    .flatMap(([k, v]) => [[k, v], ['node:' + k, v]]));

  const libMocks = fromEntries([
    'express',
    'better-sqlite3',
  ].map( m => [m, options[m] ?? resolve(path.join(__dirname, 'libs', m))] ))

  if (options.fs === '@isomorphic-git/lightning-fs') {
    const lfs = resolve(path.join(__dirname, 'polyfills/fs/lightning-fs'))
    const lfsp = resolve(path.join(__dirname, 'polyfills/fs/lightning-fs/promises'))
    Object.assign(nodeMocks, { fs: lfs, 'fs/promises': lfsp })
  }

  console.log(alias)

  return {
    name: 'node',

    config(config) {
      const _manualChunks = config?.build?.rollupOptions?.output?.manualChunks
      const { rolldownVersion } = this.meta ?? {}
      const match = (...paths) => id => paths.some(p => id.includes(p))
      return {
        define: {
          'process.env.NODE_ENV': 'process.env.NODE_ENV', // Prevent vite from writing this
        },
        resolve: {
          alias: {
            ...unsupported,
            ...nodeMocks,
            ...libMocks,
          }
        },
        build: rolldownVersion? {
          rolldownOptions: {
            output: {
              banner: windowBootstrap,
              codeSplitting: { groups: [
                { test: match('vite-plugin-cds/node/', '@sqlite.org/sqlite-wasm', 'commonjsHelpers.js', 'vite/modulepreload-polyfill.js'), name: 'node', priority: 10, },
              ]},
            },
          },
        } : {
          rollupOptions: {
            output: {
              banner: windowBootstrap,
              manualChunks: (id, api) => {
                const match = (...paths) => paths.some(p => id.includes(p))
                if (match('vite-plugin-cds/node/', '@sqlite.org/sqlite-wasm', 'commonjsHelpers.js', 'vite/modulepreload-polyfill.js')) {
                  return 'node'
                }
                return _manualChunks?.(id, api) ?? null
              }
            }
          }
        },
        worker: rolldownVersion? {
          rolldownOptions: {
            output: {
              banner: windowBootstrap,
            },
          },
        } : {
          rollupOptions: {
            output: {
              banner: windowBootstrap,
            }
          }
        },

        // for sqlite3-wasm
        server: {
          headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
          },
        },
        optimizeDeps: {
          exclude: ['@sqlite.org/sqlite-wasm'],
        },
      };
    },
    transform(code, id) {
      if (/node_modules\/vite\/dist\/client\/env.mjs$/.test(id)) {
        return `${windowBootstrap}\n${code}`;
      }
      return null;
    },
  };
}
