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
    'events', 'fs', 'fs/promises', 'path', 'async_hooks', 'util'
  ].map( m => [m, resolve(path.join(__dirname, 'polyfills', m))] ))

  return {
    name: 'node',

    enforce: 'pre',
    config() {
      return {
        define: {
          'process.env.NODE_ENV': 'process.env.NODE_ENV', // Prevent vite from writing this
        },
        resolve: {
          alias: {
            ...nodeMocks,
            ...Object.fromEntries(Object.entries(nodeMocks).map(([k,v]) => ['node:' + k, v])),
          }
        },
        worker: {
          rollupOptions: {
            output: {
              banner: windowBootstrap,
            }
          }
        }
      };
    },
    transform(code, id) {
      if (/\.(m?[jt]sx?)$/.test(id)) {
        return `${windowBootstrap}\n${code}`;
      }
      return null;
    },
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          // Inline so it runs immediately before other scripts
          children: windowBootstrap,
          injectTo: 'head',
        },
      ];
    },
  };
}
