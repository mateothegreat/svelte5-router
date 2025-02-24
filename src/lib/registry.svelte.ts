import { type Instance } from "./instance.svelte";
import { logger } from "./logger";
import { type Route } from "./route.svelte";

/**
 * The handlers type that is used when registering a router instance.
 */
export type RouterHandlers = {
  /**
   * The handler for the pushState event.
   */
  pushStateHandler: () => void,

  /**
   * The handler for the replaceState event.
   */
  replaceStateHandler: () => void,

  /**
   * The handler for the popState event.
   */
  popStateHandler: () => void
}

/**
 * Holds the original history methods and the instances of the router.
 *
 * This is used to restore the original history methods when the last instance is destroyed
 * and to register & unregister the event listeners for the router instances to prevent memory leaks.
 */
class routerRegistry {
  /**
   * The original pushState method.
   */
  private pushState = window.history.pushState;

  /**
   * The original replaceState method.
   */
  private replaceState = window.history.replaceState;

  /**
   * The instances of the router.
   */
  instances = new Map<string, {
    instance: Instance,
    handlers: RouterHandlers,
    children: Set<string>
  }>();

  /**
   * The processing queue for the router instances.
   */
  private processingQueue: Set<string> = new Set();

  /**
   * Register a new router instance.
   *
   * @param {Instance} instance The instance to register.
   *
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

    /**
     * Register parent-child relationship
     */
    if (instance.config.basePath) {
      for (const [id, entry] of this.instances) {
        const parentBasePath = entry.instance.config.basePath || '';
        if (instance.config.basePath.startsWith(parentBasePath) && instance.id !== id) {
          entry.children.add(instance.id);
          break;
        }
      }
    }

    /**
     * This allows us to log when we're in debug mode otherwise
     * this statement is removed by the compiler (tree-shaking):
     */
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
   *
   * @param {string} instanceId The id of the instance to handle the state change for.
   * @param {string} path The path to handle the state change for.
   *
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
        const route = entry.instance.get(path);
        await entry.instance.onStateChange(route);
      }
    } finally {
      this.processingQueue.delete(instanceId);
    }
  }

  /**
   * Unregister a router instance by removing it from the registry and
   * restoring the original history methods.
   *
   * This is called when a router instance is removed from the DOM
   * triggered by the `onDestroy` lifecycle method of the router instance.
   *
   * @param {string} id The id of the instance to unregister.
   *
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

  /**
   * Get the route for a given path.
   *
   * @param {string} path The path to get the route for.
   *
   * @returns {Route | undefined} The route for the given path.
   */
  get(path: string): Route | undefined {
    for (const [_, entry] of this.instances) {
      if (entry.instance.current) {
        if (entry.instance.current.test(path)) {
          return entry.instance.current;
        }
      }
    }
  }

  /**
   * Clear the active classes for all instances.
   *
   * This is called when a route has changed and we need to clear
   * the active classes activated previously.
   *
   * @returns {void}
   */
  clearActiveClasses(): void {
    for (const [_, entry] of this.instances) {
      for (let route of entry.instance.config.routes) {
        console.log("clearing", route.path, route.active());
        // route.setActive(false);
      }
    }
  }
};

/**
 * Expose a reference to the registry of router instances.
 *
 * This is used to register & unregister router instances and to get
 * the route for a given path.
 *
 * This is a singleton and should not be instantiated directly and should
 * never be accessed outside of the scope of this package in most cases.
 *
 * @type {routerRegistry}
 */
export const RouterRegistry = new routerRegistry();
