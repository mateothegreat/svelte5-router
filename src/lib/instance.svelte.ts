import type { Component, Snippet } from 'svelte';

export type PreHooks = ((route: Route) => Route)[] | ((route: Route) => Route);
export type PostHooks = ((route: Route) => void)[] | ((route: Route) => void);

export interface Route {
  path: RegExp | string;
  component?: Component<any> | Snippet;
  props?: Record<string, any>;
  pre?: PreHooks;
  post?: PostHooks;
  children?: Route[];
  params?: string[];
}

/**
 * A router instance that each <Router/> component creates.
 */
export class Instance {
  routes: Route[] = [];
  pre?: PreHooks;
  post?: PostHooks;
  current = $state<Route>();

  /**
   * Creates a new router instance.
   * @param {Route[]} routes The routes to navigate to.
   * @param {PreHooks} pre (optional) The pre hooks to run before navigating to a route.
   * @param {PostHooks} post (optional) The post hooks to run after navigating to a route.
   */
  constructor(routes: Route[], pre?: PreHooks, post?: PostHooks) {
    this.routes = routes;
    this.current = get(this, this.routes, location.pathname);
    this.pre = pre;
    this.post = post;

    this.run(this.current);

    // Setup a history watcher to navigate to the current route:
    window.addEventListener("pushState", (event: Event) => {
      const route = get(this, this.routes, location.pathname);
      this.current = route;
    });
  }

  /**
   * Navigates to a given route, running  the pre and post hooks.
   * @param {Route} route The route to navigate to.
   * @returns {Route} The route that was navigated to.
   */
  run(route: Route) {
    // First, run the global pre hooks.
    if (this.pre) {
      if (Array.isArray(this.pre)) {
        for (const pre of this.pre) {
          route = pre(route);
        }
      } else {
        route = this.pre(route);
      }
    }

    // Then, run the route specific pre hooks.
    if (route && route.pre) {
      if (Array.isArray(route.pre)) {
        for (const pre of route.pre) {
          const r = pre(route);
          if (r) {
            return r;
          }
        }
      } else {
        const r = route.pre(route);
        if (r) {
          route = r
        }
      }
    }

    // Then, set the current route and given `current` is
    // a reactive $state() variable, it will trigger a render:
    this.current = route;

    // Run the route specific post hooks:
    if (route && route.post) {
      if (Array.isArray(route.post)) {
        for (const post of route.post) {
          post(route);
        }
      } else {
        route.post(route);
      }
    }

    // Finally, run the global post hooks:
    if (this.post) {
      if (Array.isArray(this.post)) {
        for (const post of this.post) {
          post(route);
        }
      } else {
        this.post(route);
      }
    }

  }
}

/**
 * Get the route for a given path.
 * @param {Instance} routerInstance The router instance to get the route for.
 * @param {Route[]} routes The routes to get the route for.
 * @param {string} path The path to get the route for.
 * @param {ParentRoute} parent The parent route to get the route for.
 * @returns {Route} The route for the given path.
 */
export const get = (
  routerInstance: Instance,
  routes: Route[],
  path: string,
): Route => {
  let route: Route;

  // If the path is the root path, return the root route:
  if (path === "/") {
    route = routes.find((route) => route.path === "/");
  }

  // Split the path into the first segment and the rest:
  const [first, ...rest] = path.replace(/^\//, "").split("/");
  route = routes.find((route) => route.path === first);

  // If the route is not found, try to find a route that matches the path:
  if (!route) {
    for (const r of routes) {
      const regexp = new RegExp(r.path);
      const match = regexp.exec(path);
      if (match) {
        route = { ...r, params: match.slice(1) };
        break;
      }
    }
  }

  return route;
};

/**
 * Sets up a new history watcher for a router instance.
 * @param {Instance} instance The router instance to setup the history watcher for.
 */
export const setupHistoryWatcher = (instance: Instance) => {
  const { pushState } = window.history;

  if (!(window.history as any)._listenersAdded) {
    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      window.dispatchEvent(new Event("pushState"));
    };

    window.addEventListener("pushState", (event: Event) => {
      instance.run(get(instance, instance.routes, location.pathname));
    });

    (window.history as any)._listenersAdded = true;
  }
};
