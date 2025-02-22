import type { Component, Snippet } from 'svelte';

/**
 * A pre hook that can be used to modify the route before it is navigated to.
 */
export type PreHooks = ((route: Route) => Route)[] | ((route: Route) => Promise<Route>)[] | ((route: Route) => Route) | ((route: Route) => Promise<Route>);

/**
 * A post hook that can be used to modify the route after it is navigated to.
 */
export type PostHooks = ((route: Route) => void)[] | ((route: Route) => Promise<void>)[] | ((route: Route) => void) | ((route: Route) => Promise<void>);

/**
 * A route that can be navigated to.
 */
export interface Route {
  path: RegExp | string;
  component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;
  props?: Record<string, any>;
  pre?: PreHooks;
  post?: PostHooks;
  children?: Route[];
  params?: string[] | Record<string, string>;
}

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
  pushState = window.history.pushState;
  replaceState = window.history.replaceState;
  instances = new Map<string, {
    pushStateHandler: () => void,
    replaceStateHandler: () => void,
    popStateHandler: () => void
  }>();

  /**
   * Register a new router instance.
   * @param {Instance} instance The instance to register.
   * @returns {Object} The handlers for the router instance.
   */
  register(instance: Instance): RouterHandlers {
    const handlers = {
      pushStateHandler: () => instance.onStateChange(location.pathname),
      replaceStateHandler: () => instance.onStateChange(location.pathname),
      popStateHandler: () => instance.onStateChange(location.pathname)
    };

    this.instances.set(instance.id, handlers);

    return handlers;
  }

  /**
   * Unregister a router instance.
   * @param {string} id The id of the instance to unregister.
   * @returns {void}
   */
  unregister(id: string): void {
    const handler = this.instances.get(id);
    if (handler) {
      window.removeEventListener("pushState", handler.pushStateHandler);
      window.removeEventListener("replaceState", handler.replaceStateHandler);
      window.removeEventListener("popstate", handler.popStateHandler);
      this.instances.delete(id);
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

/**
 * A router instance that each <Router/> component creates.
 */
export class Instance {
  id = Math.random().toString(36).substring(2, 15);
  basePath?: string;
  routes: Route[] = [];
  #pre?: PreHooks;
  #post?: PostHooks;
  current = $state<Route>();
  navigating = $state(false);

  /**
   * Creates a new router instance.
   * @param {string} basePath (optional) The base path to navigate to.
   * @param {Route[]} routes The routes to navigate to.
   * @param {PreHooks} pre (optional) The pre hooks to run before navigating to a route.
   * @param {PostHooks} post (optional) The post hooks to run after navigating to a route.
   * @param {string} currentPath (optional) The current path to automaticallynavigate to.
   */
  constructor(basePath: string, routes: Route[], pre?: PreHooks, post?: PostHooks, currentPath?: string) {
    this.basePath = basePath;
    this.routes = routes;
    if (currentPath) {
      this.current = this.get(currentPath);
    }
    this.#pre = pre;
    this.#post = post;

    const { pushState, replaceState } = window.history;

    if (!RouterRegistry.instances.has(this.id)) {
      const handlers = RouterRegistry.register(this);

      if (RouterRegistry.instances.size === 1) {
        // Only override history methods once
        window.history.pushState = function (...args) {
          pushState.apply(window.history, args);
          window.dispatchEvent(new Event("pushState"));
        };
        window.history.replaceState = function (...args) {
          replaceState.apply(window.history, args);
          window.dispatchEvent(new Event("replaceState"));
        };
      }

      window.addEventListener("pushState", handlers.pushStateHandler);
      window.addEventListener("replaceState", handlers.replaceStateHandler);
      window.addEventListener("popstate", handlers.popStateHandler);
    }
  }

  /**
   * Get the route for a given path.
   * @returns { Route } The route for the given path.
   */
  get(path: string): Route | undefined {
    let route: Route | undefined;

    let pathToMatch = path;
    // If the base path is set, remove it from the path:
    if (this.basePath && this.basePath !== "/") {
      pathToMatch = path.replace(this.basePath, "");
    }

    // If the path is the root path, return the root route:
    if (pathToMatch === "/") {
      route = this.routes.find((route) => route.path === "/");
    }

    // Split the path into the first segment and the rest:
    const [first, ...rest] = pathToMatch.replace(/^\//, "").split("/");
    route = this.routes.find((route) => route.path === first);

    // If the route is not found, try to find a route that matches at least part of the path:
    if (!route) {
      for (const r of this.routes) {
        const regexp = new RegExp(r.path);
        const match = regexp.exec(path);
        if (match) {
          route = { ...r, params: match.groups || match.slice(1) };
          break;
        }
      }
    }

    return route;
  }

  /**
   * Navigates to a given route, running  the pre and post hooks.
   * @param {Route} route The route to navigate to.
   * @returns {Promise<void>}
   */
  async run(route: Route): Promise<void> {
    this.navigating = true;

    // First, run the global pre hooks.
    if (this.#pre) {
      if (Array.isArray(this.#pre)) {
        for (const pre of this.#pre) {
          route = await pre(route);
        }
      } else {
        route = await this.#pre(route);
      }
    }

    // Then, run the route specific pre hooks.
    if (route && route.pre) {
      if (Array.isArray(route.pre)) {
        for (const pre of route.pre) {
          const r = await pre(route);
          if (r) {
            route = r;
          }
        }
      } else {
        const r = await route.pre(route);
        if (r) {
          route = r
        }
      }
    }

    // Then, set the current route and given `current` is
    // a reactive $state() variable, it will trigger a render.
    // Only set the current route if it's different from the
    // current route to avoid unnecessary re-rendering.
    if (route.path !== this.current?.path) {
      this.current = route;
    }

    // Run the route specific post hooks:
    if (route && route.post) {
      if (Array.isArray(route.post)) {
        for (const post of route.post) {
          await post(route);
        }
      } else {
        await route.post(route);
      }
    }

    // Finally, run the global post hooks:
    if (this.#post) {
      if (Array.isArray(this.#post)) {
        for (const post of this.#post) {
          await post(route);
        }
      } else {
        await this.#post(route);
      }
    }

    this.navigating = false;
  }

  /**
   * Handle a state change event.
   * @param {string} path The path to navigate to.
   * @returns {void}
   */
  onStateChange(path: string): void {
    const route = this.get(path);
    if (route) {
      this.run(route);
    }
  }

  /**
   * Destroy the router instance.
   * @returns {void}
   */
  destroy(): void {
    RouterRegistry.unregister(this.id);
  }
}
