export class EventEmitter extends EventTarget {
    constructor() {
        super();
        const emitter = this;
        this._listeners = new class ListenerMap extends Map {

            get(event) {
                if (!this.has(event)) {
                    const listeners = [];
                    this.set(event, listeners);
                    emitter.addEventListener(event, async function (...args) {
                        for (const listener of listeners) {
                            await listener.call(this, ...args)
                        }
                    });
                }
                return super.get(event)
            }
        }();
    }
    emit(eventName, ...args) {
        const event = new Event(eventName, { bubbles: true, cancelable: false });
        this.dispatchEvent(event);
    }

    on(eventName, cb) {
        // TODO
        this.addEventListener(eventName, cb)
    }

    once(eventName, cb) {
        // TODO
        this.addEventListener(eventName, cb, { once: true })
    }

    prependListener(eventName, cb) {
        this._listeners.get(eventName).unshift(cb)
    }

    listeners(eventName) {
        return this._listeners.get(eventName)
    }

}
