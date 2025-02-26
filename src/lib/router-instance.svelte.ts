import { registry, RouterInstanceConfig, type Hooks } from ".";
import { log } from "./logger";
import { normalize } from "./paths";
import type { Route } from "./route.svelte";
import { execute } from "./utilities.svelte";

import type { ApplyFn } from "./registry/types";

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

export class RouterInstance {
  routes: Set<Route>;
  handlers: RouterHandlers;
  config: RouterInstanceConfig;
  applyFn: ApplyFn;
  navigating = $state(false);
  current = $state<Route>();

  constructor(config: RouterInstanceConfig, applyFn: ApplyFn) {
    this.config = config;
    this.routes = new Set();
    this.applyFn = applyFn;

    this.handlers = {
      pushStateHandler: () => this.handleStateChange(location.pathname),
      replaceStateHandler: () => this.handleStateChange(location.pathname),
      popStateHandler: () => this.handleStateChange(location.pathname)
    };

    window.addEventListener("pushState", this.handlers.pushStateHandler);
    window.addEventListener("replaceState", this.handlers.replaceStateHandler);
    window.addEventListener("popstate", this.handlers.popStateHandler);

    for (let route of config.routes) {
      this.routes.add(route);
    }

    // this.handleStateChange(location.pathname);
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
  async handleStateChange(path: string): Promise<void> {
    const route = this.get(path.replace(this.config.basePath || "/", ""));
    if (route) {
      this.navigating = true;

      // Run the global pre hooks:
      if (this.config.pre) {
        if (!(await this.evaluateHooks(route, this.config.pre))) {
          return;
        }
      }

      // Run the route specific pre hooks:
      if (route.pre) {
        if (!(await this.evaluateHooks(route, route.pre))) {
          return;
        }
      }

      this.applyFn(route);

      // Run the route specific post hooks:
      if (route && route.post) {
        if (!(await this.evaluateHooks(route, route.post))) {
          return;
        }
      }

      // Finally, run the global post hooks:
      if (this.config.post) {
        await this.evaluateHooks(route, this.config.post)
      }

      this.current = route;
      this.navigating = false;
    }
  }

  async evaluateHooks(route: Route, hooks: Hooks): Promise<boolean> {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        if (!(await execute(() => hook(route)))) {
          return false;
        }
      }
    } else {
      if (!(await execute(() => hooks(route)))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Unregister a router instance by removing it from the registry and
   * restoring the original history methods.
   *
   * This is called when a router instance is removed from the DOM
   * triggered by the `onDestroy` lifecycle method of the router instance.
   */
  unregister(): void {
    window.removeEventListener("pushState", this.handlers.pushStateHandler);
    window.removeEventListener("replaceState", this.handlers.replaceStateHandler);
    window.removeEventListener("popstate", this.handlers.popStateHandler);

    // This allows us to log when we're in debug mode otherwise
    // this statement is removed by the compiler (tree-shaking):
    if (import.meta.env.SPA_ROUTER && import.meta.env.SPA_ROUTER.logLevel === "debug") {
      log.debug(this.config.id, "unregistered router instance", {
        id: this.config.id,
        routes: this.routes.size
      });
    }

    registry.unregister(this.config.id);
  }

  /**
   * Retrieve the default route for the router instance (if one exists).
   *
   * @returns {Route} The default route for the router instance.
   */
  getDefaultRoute(): Route {
    for (const route of this.routes) {
      if (!route.path) {
        return route;
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
  getByStatus(status: number): Route {
    for (const route of this.routes) {
      if (route.status === status) {
        return route;
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
  get(path: string): Route {
    if (path === "") {
      const defaultRoute = this.getDefaultRoute();
      if (defaultRoute) {
        return defaultRoute;
      }
    }

    // First check for exact route matches
    for (const route of this.routes) {
      const match = route.test(normalize(path));
      if (match) {
        return {
          ...route,
          params: match.params,
          path: match.path
        };
      }
    }
  }
}
