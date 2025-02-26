/**
 * Wait for a predicate to become true with timeout handling.
 *
 * @param predicate Function that returns boolean to check for
 * @param timeout Time in milliseconds to wait before timing out
 * @throws Error if timeout is reached before predicate becomes true
 */
export async function wait(predicate: () => boolean, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${timeout}ms waiting for predicate: ${predicate}`));
    }, timeout);

    const check = async () => {
      if (predicate()) {
        clearTimeout(timer);
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };

    check();
  });
}

/**
 * Check if a value is a promise.
 * @param value - The value to check.
 * @returns True if the value is a promise, false otherwise.
 */
export function isPromise(value: any): boolean {
  return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
}

/**
 * Execute a function and return a promise if the function is a promise.
 * @param fn - The function to execute.
 * @returns A promise if the function is a promise, otherwise the function result.
 */
export const execute = async <T>(fn: () => T | Promise<T>): Promise<T> => {
  if (isPromise(fn)) {
    return await fn();
  } else {
    return fn();
  }
}

/**
 * A reactive map that can be observed for changes using `$state()`.
 */
export class ReactiveMap<K, V> extends Map<K, V> {
  #state = $state(false);

  get size() { this.#state; return super.size; }

  #trig() {
    this.#state = !this.#state;
  }

  get(key: K) { this.#state; return super.get(key); }

  set(key: K, value: V) {
    const result = super.set(key, value);
    this.#trig();
    return result;
  }

  delete(key: K) {
    const result = super.delete(key);
    if (result) this.#trig();
    return result;
  }

  clear() {
    const result = super.clear();
    this.#trig();
    return result;
  }

  keys() { this.#state; return super.keys(); }
  values() { this.#state; return super.values(); }
  entries() { this.#state; return super.entries(); }
  forEach(fn: (value: V, key: K, map: Map<K, V>) => void) {
    this.#state;
    return super.forEach(fn);
  }

  [Symbol.iterator]() { this.#state; return super[Symbol.iterator](); }
}
