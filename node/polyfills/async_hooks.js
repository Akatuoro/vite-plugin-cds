
export const AsyncResource = class {
    constructor(type) {
    }
    runInAsyncScope(fn, thisArg, ...args) {
        return fn.apply(thisArg, args);
    }
}

export const AsyncLocalStorage = class {
    constructor() {
        this.store = new Map();
    }
    getStore() {
        return this.store;
    }
    run(store, callback, ...args) {
        const previousStore = this.store;
        this.store = store;
        try {
            return callback(...args);
        }
        finally {
            this.store = previousStore;
        }
    }
    enterWith(store) {
        this.store = store;
    }
}
