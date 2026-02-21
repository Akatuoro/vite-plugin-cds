
export const AsyncResource = class {
    constructor(type) {
    }
    runInAsyncScope(fn, thisArg, ...args) {
        return fn.apply(thisArg, args);
    }
}

let i = 0;
let stored;
const storageMap = new Map();
export const AsyncLocalStorage = class {
    getStore() {
        // V8 allows tracing of async function calls.
        // All involved functions must be recognizable as such (-> async).
        // Promise forwarding without async (`function (cb) {return cb().then() }`) can break it.
        // https://v8.dev/docs/stack-trace-api
        const original = Error.stackTraceLimit;
        Error.stackTraceLimit = Infinity;
        const err = new Error();
        const { stack } = err;
        Error.stackTraceLimit = original;

        for (const [name] of stack?.matchAll(/__asyncStore\d+/g)) {
            if (storageMap.has(name)) return storageMap.get(name);
        }
        return stored;
    }
    async run(store, callback, ...args) {
        const previousStore = stored;
        stored = store;
        const name = `__asyncStore${i++}`

        // Place a marker for the stack trace
        const fn = (new Function(`return async function ${name}(cb, ...args) { return await cb(...args) }`))()
        storageMap.set(fn.name, store)
        try {
            return await fn(callback, ...args)
        }
        finally {
            stored = previousStore;
        }
    }
    enterWith(store) {
        stored = store;
    }
}
