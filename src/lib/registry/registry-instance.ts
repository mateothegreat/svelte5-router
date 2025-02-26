import type { Instance } from "../instance.svelte";
import { log } from "../logger";
import type { RegistryMatch } from "../registry.svelte";
import type { Route } from "../route.svelte";

import { goto, type Router } from "..";

/**
 * The handlers type that is used when registering a router instance.
 *
 * This is used to restore the original history methods when the last instance is destroyed
 * and to register & unregister the event listeners for the router instances to prevent memory leaks.
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

export class RegistryInstance {
  instance: Instance;
  router: Router;
  routes: Set<Route>;
  handlers: RouterHandlers;

  constructor(instance: Instance) {
    this.instance = instance;
    this.routes = new Set();

    const handlers = {
      pushStateHandler: () => this.handleStateChange(instance.id, location.pathname),
      replaceStateHandler: () => this.handleStateChange(instance.id, location.pathname),
      popStateHandler: () => this.handleStateChange(instance.id, location.pathname)
    };

    for (let route of this.instance.config.routes) {
      this.routes.add(route);
    }
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
  private handleStateChange(instanceId: string, path: string): void {
    this.instance.onStateChange(this.instance.get(path));
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
    window.removeEventListener("pushState", this.handlers.pushStateHandler);
    window.removeEventListener("replaceState", this.handlers.replaceStateHandler);
    window.removeEventListener("popstate", this.handlers.popStateHandler);

    // This allows us to log when we're in debug mode otherwise
    // this statement is removed by the compiler (tree-shaking):
    if (import.meta.env.SPA_ROUTER && import.meta.env.SPA_ROUTER.logLevel === "debug") {
      log.debug(id, "unregistered router instance", {
        id: this.instance.id
      });
    }
  }

  getDefaultRoute(): RegistryMatch {
    for (const route of this.routes) {
      if (!route.path) {
        return {
          registry: this,
          router: this.router,
          instance: this.instance,
          route
        };
      }
    }
  }

  /**
   * This method finds the best match for a given path.
   *
   * It first starts from the most specific route and works its down to the least specific route.
   *
   * @param {string} path The path to find the match for.
   *
   * @returns {RegistryMatch} The matched route for the given path.
   */
  private findBestMatch(path: string): RegistryMatch {
    if (path === "") {
      const defaultRoute = this.getDefaultRoute();
      if (defaultRoute) {
        return defaultRoute;
      }
    }

    // Normalize the path and split into segments
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const segments = normalizedPath.split('/').filter(Boolean);

    // First check for exact route matches
    for (const route of this.routes) {
      const match = route.test(normalizedPath);
      if (match) {
        return {
          registry: this,
          router: this.router,
          instance: this.instance,
          route: {
            ...route,
            params: match.params,
            path: match.path
          }
        };
      }
    }
  }

  /**
   * Retrieve a route for a given status code.
   *
   * @param {number} status The status code to get the route for.
   *
   * @returns {RegistryMatch} The matched route for the given status code.
   */
  getByStatus(status: number): RegistryMatch {
    for (const route of this.routes) {
      if (route.status === status) {
        return {
          registry: this,
          router: this.router,
          instance: this.instance,
          route
        };
      }
    }
  }

  /**
   * Retrieve a route for a given path.
   *
   * @param {string} path The path to get the route for.
   *
   * @returns {RegistryMatch} The matched route for the given path.
   */
  get(path: string): RegistryMatch {
    return this.findBestMatch(path);
  }

  /**
   * Navigate to a given path within this registry instance.
   *
   * If the path is not found, it will navigate to the not found route.
   *
   * @param {string} path The path to navigate to.
   */
  navigate(path: string): void {
    const route = this.get(path);
    if (route) {
      route.instance.applyFn(route);
    } else {
      const notFoundRoute = this.getByStatus(404);
      if (notFoundRoute) {
        let path = notFoundRoute.route.path as string;
        if (this.instance.config.basePath) {
          path = `${this.instance.config.basePath}${path}`;
        }
        goto(path);
      }
    }
  }
}
