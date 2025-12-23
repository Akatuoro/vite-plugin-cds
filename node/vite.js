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
export function nodeVite() {
  const windowBootstrap = fs.readFileSync(path.resolve(__dirname, 'shims/window-bootstrap.js'), 'utf-8');

  const nodeMocks = fromEntries([
    'events', 'fs', 'fs/promises', 'path', 'os', 'async_hooks', 'util', 'stream', 'stream/consumers', 'stream/promises', 'buffer', 'crypto', 'perf_hooks',
  ].map( m => [m, resolve(path.join(__dirname, 'polyfills', m))] )
    .flatMap(([k, v]) => [[k, v], ['node:' + k, v]]))

  const libMocks = fromEntries([
    'express',
    'better-sqlite3',
  ].map( m => [m, resolve(path.join(__dirname, 'libs', m))] ))

  return {
    name: 'node',

    config() {
      return {
        define: {
          'process.env.NODE_ENV': 'process.env.NODE_ENV', // Prevent vite from writing this
        },
        resolve: {
          alias: {
            ...nodeMocks,
            ...libMocks,
          }
        },
        worker: {
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
