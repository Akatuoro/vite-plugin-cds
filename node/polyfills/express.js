class ResponseMock {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = undefined;
    this.finished = false;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  set(field, value) {
    if (typeof field === 'string') {
      this.headers[field.toLowerCase()] = value;
    } else if (field && typeof field === 'object') {
      for (const [k, v] of Object.entries(field)) {
        this.headers[k.toLowerCase()] = v;
      }
    }
    return this;
  }

  json(data) {
    if (!this.headers['content-type']) {
      this.headers['content-type'] = 'application/json';
    }
    this.body = JSON.stringify(data);
    this.finished = true;
    return this;
  }

  send(data) {
    this.body = data;
    this.finished = true;
    return this;
  }

  end(data) {
    if (data !== undefined) this.body = data;
    this.finished = true;
    return this;
  }
}

function normalizePath(pathname = '/') {
  if (!pathname.startsWith('/')) return `/${pathname}`;
  return pathname;
}

function matchPath(routePath, requestPath) {
  const params = {};
  if (routePath === '*' || routePath === '/*') return { matched: true, params };

  const routeSegments = normalizePath(routePath).split('/').filter(Boolean);
  const pathSegments = normalizePath(requestPath).split('/').filter(Boolean);

  if (routeSegments.length !== pathSegments.length) return { matched: false, params };

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const pathSegment = pathSegments[i];

    if (routeSegment.startsWith(':')) {
      params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
      continue;
    }

    if (routeSegment !== pathSegment) return { matched: false, params };
  }

  return { matched: true, params };
}

class MiniExpress {
  constructor(basePath = '/') {
    this.basePath = normalizePath(basePath);
    this.stack = [];
  }

  use(pathOrHandler, ...handlers) {
    const hasPath = typeof pathOrHandler === 'string';
    const path = hasPath ? normalizePath(pathOrHandler) : '/';
    const fns = hasPath ? handlers : [pathOrHandler, ...handlers];

    for (const fn of fns) {
      this.stack.push({ type: 'middleware', path, handler: this._wrap(fn) });
    }
    return this;
  }

  _wrap(handler) {
    if (handler instanceof MiniExpress) {
      return (req, res, next) => handler.handle(req, res, next);
    }
    return handler;
  }

  _addRoute(method, path, handlers) {
    const wrapped = handlers.map(h => this._wrap(h));
    this.stack.push({ type: 'route', method, path: normalizePath(path), handlers: wrapped });
  }

  get(path, ...handlers) { this._addRoute('GET', path, handlers); return this; }
  post(path, ...handlers) { this._addRoute('POST', path, handlers); return this; }
  put(path, ...handlers) { this._addRoute('PUT', path, handlers); return this; }
  delete(path, ...handlers) { this._addRoute('DELETE', path, handlers); return this; }
  patch(path, ...handlers) { this._addRoute('PATCH', path, handlers); return this; }
  all(path, ...handlers) { this._addRoute('ALL', path, handlers); return this; }

  async handle(req = {}, res = new ResponseMock(), out = () => {}) {
    const request = {
      method: (req.method || 'GET').toUpperCase(),
      path: normalizePath(req.path || req.url || '/'),
      headers: req.headers || {},
      body: req.body,
      query: req.query || {},
      params: {},
      ...req,
    };

    const layers = this.stack;
    let idx = 0;

    const next = async (err) => {
      const layer = layers[idx++];
      if (!layer) return out(err);

      if (layer.type === 'middleware') {
        if (!request.path.startsWith(layer.path)) return next(err);
        return this._runHandlers([layer.handler], request, res, next, err);
      }

      if (layer.type === 'route') {
        if (err) return next(err);
        if (layer.method !== 'ALL' && layer.method !== request.method) return next();
        const { matched, params } = matchPath(layer.path, request.path);
        if (!matched) return next();
        request.params = params;
        return this._runHandlers(layer.handlers, request, res, next);
      }

      return next();
    };

    await next();
    return res;
  }

  async _runHandlers(handlers, req, res, next, err) {
    let i = 0;
    const runner = async (runErr) => {
      if (res.finished) return;
      const handler = handlers[i++];
      if (!handler) return next(runErr);
      if (handler.constructor === Array) {
        await this._runHandlers(handler, req, res, runner, runErr);
      }
      else {
        const isErrorHandler = handler.length === 4;
        if (runErr && !isErrorHandler) return runner(runErr);
        if (!runErr && isErrorHandler) return runner();

        try {
          const maybePromise = isErrorHandler ? handler(runErr, req, res, runner) : handler(req, res, runner);
          if (maybePromise && typeof maybePromise.then === 'function') {
            await maybePromise;
          }
        } catch (error) {
          return runner(error);
        }
      }
    };
    await runner(err);
  }

  listen(_port, cb) {
    if (typeof cb === 'function') cb();
    return { close() {} };
  }
}

function express() {
  return new MiniExpress();
}

express.Router = function Router() {
  return new MiniExpress();
};

export default express;
export { express };
