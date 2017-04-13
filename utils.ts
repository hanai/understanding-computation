type Constructor<T> = new(...args: any[]) => T;

export function log(...args) {
    return console.log.call(this, ...args);
}
