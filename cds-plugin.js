import { createServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import cds from '@sap/cds';

// global port counter
let hmrPort = 24100;
function getHmrPort() {
  return hmrPort++;
}

function stat(file) {
  return fs.stat(file).catch((e) => e.code === 'ENOENT' ? null : Promise.reject(e));
}

async function findViteApps() {
  const apps = [];
  const appsDir = path.resolve('./app');
  const entries = await fs.readdir(appsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(appsDir, entry.name);
    const stats = await stat(fullPath);
    const viteConfig = await stat(path.join(fullPath, 'vite.config.js'));
    if (stats.isDirectory() && viteConfig?.isFile()) {
      apps.push({ name: entry.name, path: fullPath });
    }
  }
  return apps;
}

function normalizeBase(base) {
  if (!base.startsWith('/')) {
    base = `/${base}`;
  }
  return base.endsWith('/') ? base : `${base}/`;
}

function getRouterStack(router) {
  return router?._router?.stack || router?.stack || [];
}

function removeStatic(router, match) {
  const stack = getRouterStack(router);
  for (let i = stack.length - 1; i >= 0; i--) {
    const layer = stack[i];
    if (layer?.name === 'serveStatic' && String(layer.regexp).includes(match)) {
      stack.splice(i, 1);
    }
  }
}


async function startViteApp(app, base = app.name) {
  base = normalizeBase(base);
  const server = await createServer({
    base,
    root: path.resolve(app.path),
    server: {
      middlewareMode: true,
      hmr: { port: getHmrPort() },
    },
  });

  return {app, server};
}

async function startAll(router) {
  const apps = await findViteApps();

  removeStatic(router, '/^\\/?(?=\\/|$)/i');

  for (const app of apps) {
    const { server } = await startViteApp(app);
    router.use(server.config.base, server.middlewares);
  }

  console.log('🚀 All Vite servers are running!');
}

cds.on('bootstrap', app => cds.on('served', () => startAll(app)));
