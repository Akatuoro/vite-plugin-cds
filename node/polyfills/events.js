export class EventEmitter extends EventTarget {
    emit(eventName, ...args) {
        const event = new Event(eventName, { bubbles: true, cancelable: false });
        this.dispatchEvent(event);
    }
}
