import { EventEmitter } from 'events';

class ResponseMock extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 200;
    this.headers = {};
    this.body = undefined;
    this._chunks = [];
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
    return this.end(JSON.stringify(data));
  }

  send(data) {
    if (data === undefined) return this.end('');

    const isBuffer = data instanceof Buffer;
    const isArrayBuffer = data instanceof ArrayBuffer;
    const isView = ArrayBuffer.isView(data);

    if (data === null) {
      return this.end('null');
    }

    if (!isBuffer && !isArrayBuffer && !isView && typeof data === 'object') {
      if (!this.headers['content-type']) {
        this.headers['content-type'] = 'application/json';
      }
      return this.end(JSON.stringify(data));
    }

    return this.end(String(data));
  }

  end(data) {
    if (data !== undefined) this.write(data);
    this.body = this._collectBody();
    this.finished = true;
    this.emit('finish');
    return this;
  }

  write(chunk) {
    if (chunk === undefined || chunk === null) return this;
    this._chunks.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return this;
  }

  writeHead(statusCode, headers = {}) {
    this.statusCode = statusCode;
    this.set(headers);
    return this;
  }

  setHeader(name, value) { return this.set(name, value); }
  getHeader(name) { return this.headers[name?.toLowerCase()]; }

  _collectBody() {
    if (this._chunks.length === 0) return this.body;
    return this._chunks.join('');
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
      const handler = fn instanceof MiniExpress || typeof fn?.handle === 'function'
        ? this._wrapRouter(fn, path)
        : this._wrap(fn);
      this.stack.push({ type: 'middleware', path, handler });
    }
    return this;
  }

  _wrap(handler) {
    return handler;
  }

  _wrapRouter(router, mountPath) {
    const base = normalizePath(mountPath);
    return async (req, res, next) => {
      if (!req.path.startsWith(base)) return next();

      const originalUrl = req.url || req.path || '/';
      const originalPath = req.path || '/';
      const originalBaseUrl = req.baseUrl || '';

      let delegated = false;
      const wrappedNext = async (err) => {
        delegated = true;
        return next(err);
      };

      req.baseUrl = originalBaseUrl + base;
      req.url = normalizePath(originalUrl.slice(base.length) || '/');
      req.path = normalizePath(originalPath.slice(base.length) || '/');

      try {
        await router.handle(req, res, wrappedNext);
      } finally {
        req.baseUrl = originalBaseUrl;
        req.url = originalUrl;
        req.path = originalPath;
      }

      if (!delegated && !res.finished) {
        return next();
      }
    };
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
  head(path, ...handlers) { this._addRoute('HEAD', path, handlers); return this; }
  all(path, ...handlers) { this._addRoute('ALL', path, handlers); return this; }

  async handle(req = {}, res = new ResponseMock(), out = () => {}) {
    const response = res || new ResponseMock();
    const request = {
      method: (req.method || 'GET').toUpperCase(),
      path: normalizePath(req.path || req.url || '/'),
      headers: req.headers || {},
      body: req.body,
      query: req.query || {},
      params: {},
      ...req,
    };

    request.get = request.get || request.header || ((name) => {
      if (!name) return undefined;
      return request.headers?.[name.toLowerCase()];
    });
    request.header = request.header || request.get;

    const layers = this.stack;
    let idx = 0;

    const finalize = async (err) => {
      await out(err);

      if (err && !response.finished) {
        response.status(err.status || err.statusCode || 500);
        const body = err.body || {
          error: {
            message: err.message,
            code: err.code,
            '@Common.numericSeverity': err.numericSeverity,
          },
        };
        response.json(body);
      }

      return response;
    };

    const next = async (err) => {
      const layer = layers[idx++];
      if (!layer) return finalize(err);

      if (layer.type === 'middleware') {
        if (!request.path.startsWith(layer.path)) return next(err);
        return this._runHandlers([layer.handler], request, response, next, err);
      }

      if (layer.type === 'route') {
        if (err) return next(err);
        if (
          layer.method !== 'ALL'
          && layer.method !== request.method
          && !(request.method === 'HEAD' && layer.method === 'GET')
        ) return next();
        const { matched, params } = matchPath(layer.path, request.path);
        if (!matched) return next();
        request.params = params;
        return this._runHandlers(layer.handlers, request, response, next);
      }

      return next();
    };

    await next();
    if (!response.finished) {
      await new Promise((resolve) => response.once('finish', resolve));
    }
    if (request.method === 'HEAD') {
      response.body = undefined;
      response._chunks = [];
    }
    return response;
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

MiniExpress.application = {};

function express() {
  return new MiniExpress();
}

express.application = {};
express.text = (options = {}) => {
  const encoding = options.encoding || 'utf-8';

  return (req, _res, next) => {
    if (typeof req.body === 'string') return next();

    if (req.body === undefined || req.body === null) {
      req.body = '';
      return next();
    }

    if (req.body instanceof Buffer) {
      req.body = req.body.toString(encoding);
      return next();
    }

    if (ArrayBuffer.isView(req.body)) {
      req.body = Buffer.from(req.body.buffer, req.body.byteOffset, req.body.byteLength).toString(encoding);
      return next();
    }

    if (req.body instanceof ArrayBuffer) {
      req.body = Buffer.from(req.body).toString(encoding);
      return next();
    }

    req.body = String(req.body);
    return next();
  };
};

express.Router = function Router() {
  return new MiniExpress();
};

export default express;
export { express };
