import type { Instance } from "./instance.svelte";
import { logger } from "./logger";

export type RouterHandlers = {
  pushStateHandler: () => void,
  replaceStateHandler: () => void,
  popStateHandler: () => void
}

/**
 * Hold the original history methods and the instances of the router.
 * This is used to restore the original history methods when the last instance is destroyed
 * and to register & unregister the event listeners for the router instances to prevent memory leaks.
 */
class routerRegistry {
  private pushState = window.history.pushState;
  private replaceState = window.history.replaceState;
  private instances = new Map<string, {
    instance: Instance,
    handlers: RouterHandlers,
    children: Set<string>
  }>();
  private processingQueue: Set<string> = new Set();

  /**
   * Register a new router instance.
   * @param {Instance} instance The instance to register.
   * @returns {Object} The handlers for the router instance.
   */
  register(instance: Instance): RouterHandlers {
    const handlers = {
      pushStateHandler: () => this.handleStateChange(instance.id, location.pathname),
      replaceStateHandler: () => this.handleStateChange(instance.id, location.pathname),
      popStateHandler: () => this.handleStateChange(instance.id, location.pathname)
    };

    this.instances.set(instance.id, {
      instance,
      handlers,
      children: new Set()
    });

    // Register parent-child relationship
    if (instance.config.basePath) {
      for (const [id, entry] of this.instances) {
        const parentBasePath = entry.instance.config.basePath || '';
        if (instance.config.basePath.startsWith(parentBasePath) && instance.id !== id) {
          entry.children.add(instance.id);
          break;
        }
      }
    }

    // This allows us to log when we're in debug mode otherwise
    // this statement is removed by the compiler (tree-shaking):
    if (import.meta.env.SPA_ROUTER?.logLevel === "debug") {
      logger.debug(instance.id, "registered router instance", {
        count: this.instances.size
      });
    }

    return handlers;
  }

  /**
   * Handle a state change event by adding the instance to the processing queue for
   * the duration of the state change. This is to prevent multiple state changes from
   * happening at the same time.
   * @param {string} instanceId The id of the instance to handle the state change for.
   * @param {string} path The path to handle the state change for.
   * @returns {Promise<void>}
   */
  private async handleStateChange(instanceId: string, path: string): Promise<void> {
    if (this.processingQueue.has(instanceId)) {
      return;
    }

    // Add the instance to the processing queue:
    this.processingQueue.add(instanceId);

    try {
      const entry = this.instances.get(instanceId);
      if (entry) {
        await entry.instance.onStateChange(path);
      }
    } finally {
      this.processingQueue.delete(instanceId);
    }
  }

  /**
   * Unregister a router instance by removing it from the registry and
   * restoring the original history methods.
   * @param {string} id The id of the instance to unregister.
   * @returns {void}
   */
  unregister(id: string): void {
    const entry = this.instances.get(id);
    if (entry) {
      // Remove this instance as a child from any parent
      for (const [_, parentEntry] of this.instances) {
        parentEntry.children.delete(id);
      }

      window.removeEventListener("pushState", entry.handlers.pushStateHandler);
      window.removeEventListener("replaceState", entry.handlers.replaceStateHandler);
      window.removeEventListener("popstate", entry.handlers.popStateHandler);

      this.instances.delete(id);

      // This allows us to log when we're in debug mode otherwise
      // this statement is removed by the compiler (tree-shaking):
      if (import.meta.env.SPA_ROUTER && import.meta.env.SPA_ROUTER.logLevel === "debug") {
        logger.debug(id, "unregistered router instance", {
          remainingInstances: this.instances.size
        });
      }
    }

    if (this.instances.size === 0) {
      window.history.pushState = this.pushState;
      window.history.replaceState = this.replaceState;
    }
  }
};

/**
 * Expose a reference to the registry of router instances.
 */
export const RouterRegistry = new routerRegistry();
