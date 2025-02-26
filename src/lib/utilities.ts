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
