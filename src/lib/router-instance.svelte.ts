import { registry, RouterInstanceConfig, type ApplyFn, type Hooks } from ".";
import { log } from "./logger";
import type { Route } from "./route.svelte";
import { execute } from "./utilities.svelte";

import { normalize } from "./helpers/normalize";

/**
 * The handlers type that is used when registering a router instance.
 *
 * This is used to restore the original history methods when the last instance is destroyed
 * and to register & unregister the event listeners for the router instances to prevent memory leaks.
 *
 * @category router
 */
export type RouterHandlers = {
  /**
   * The handler for the pushState event.
   */
  pushStateHandler: () => void;

  /**
   * The handler for the replaceState event.
   */
  replaceStateHandler: () => void;

  /**
   * The handler for the popState event.
   */
  popStateHandler: () => void;
};

/**
 * A class that represents a router instance.
 *
 * @remarks
 * This class should rarely be used directly. Instead, use the `Router` component
 * to create a new router instance.
 *
 * @category router
 */
export class RouterInstance {
  /**
   * The id of the router instance.
   */
  id: string;

  /**
   * The routes for the router instance.
   */
  routes: Set<Route>;

  /**
   * The handlers for the router instance.
   */
  handlers: RouterHandlers;

  /**
   * The config for the router instance.
   */
  config: RouterInstanceConfig;

  /**
   * The apply function for the router instance.
   */
  applyFn: ApplyFn;

  /**
   * Whether the router instance is navigating.
   */
  navigating = $state(false);

  /**
   * The current route for the router instance.
   */
  current = $state<Route>();

  /**
   * The constructor for the RouterInstance class.
   *
   * @param {RouterInstanceConfig} config The config for the router instance.
   * @param {ApplyFn} applyFn The apply function for the router instance.
   */
  constructor(config: RouterInstanceConfig, applyFn: ApplyFn) {
    this.id = config.id || Math.random().toString(36).substring(2, 15);
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
    window.removeEventListener(
      "replaceState",
      this.handlers.replaceStateHandler
    );
    window.removeEventListener("popstate", this.handlers.popStateHandler);

    // This allows us to log when we're in debug mode otherwise
    // this statement is removed by the compiler (tree-shaking):
    if (
      import.meta.env.SPA_ROUTER &&
      import.meta.env.SPA_ROUTER.logLevel === "debug"
    ) {
      log.debug(this.config.id, "unregistered router instance", {
        id: this.config.id,
        routes: this.routes.size
      });
    }

    registry.unregister(this.config.id);
  }

  /**
   * Handle a state change event by adding the instance to the processing queue for
   * the duration of the state change. This is to prevent multiple state changes from
   * happening at the same time.
   *
   * @param {string} path The path to handle the state change for.
   */
  async handleStateChange(path: string): Promise<void> {
    const route = this.get(path.replace(this.config.basePath || "/", ""));
    if (route) {
      this.navigating = true;

      let query: Record<string, string> | undefined = undefined;
      if (window.location.search) {
        query = Object.fromEntries(new URLSearchParams(window.location.search));
      }

      // Run the global pre hooks:
      if (this.config.hooks?.pre) {
        if (!(await this.evaluateHooks(route, this.config.hooks.pre))) {
          return;
        }
      }

      // Run the route specific pre hooks:
      if (route.hooks?.pre) {
        if (!(await this.evaluateHooks(route, route.hooks.pre))) {
          return;
        }
      }

      // Call the downstream router instance to apply the route:
      this.applyFn(route.component, {
        params: route.params,
        props: route.props,
        query,
        name: route.name,
        path: {
          before: route.path?.toString(),
          after: path
        }
      });

      // Run the route specific post hooks:
      if (route && route.hooks?.post) {
        if (!(await this.evaluateHooks(route, route.hooks.post))) {
          return;
        }
      }

      // Finally, run the global post hooks:
      if (this.config.hooks?.post) {
        await this.evaluateHooks(route, this.config.hooks.post);
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
   * Retrieve a route for a given path.
   *
   * @param {string} path The path to get the route for.
   *
   * @returns {RegistryMatch} The matched route for the given path.
   */
  get(path: string): Route {
    // If the path is empty, return the default route:
    if (path.length === 0) {
      const defaultRoute = this.getDefaultRoute();
      if (defaultRoute) {
        return {
          ...defaultRoute
        };
      }
    }

    // Run `test()` on each route to see if it matches the path:
    for (const route of this.routes) {
      const match = route.test(normalize(path));
      if (match) {
        route.params = match?.params ? match.params : undefined;
        return route;
      }
    }

    // No route matches, try to return a 404 route:
    if (this.config.statuses?.[404]) {
      return {
        component: this.config.statuses[404]
      };
    }
  }
}
