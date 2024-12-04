import type { Component, Snippet } from "svelte";

export type PreHooks =
  | ((route: Route) => number)[]
  | ((route: Route) => Promise<number>)[]
  | ((route: Route) => number)
  | ((route: Route) => Promise<number>);
export type PostHooks =
  | ((route: Route) => void)[]
  | ((route: Route) => Promise<void>)[]
  | ((route: Route) => void)
  | ((route: Route) => Promise<void>);

export interface Route {
  path: RegExp | string;
  component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;
  props?: Record<string, any>;
  pre?: PreHooks;
  post?: PostHooks;
  children?: Route[];
  params?: string[] | Record<string, string>;
}

/**
 * A router instance that each <Router/> component creates.
 */
export class Instance {
  id = crypto.randomUUID();
  basePath?: string;
  routes: Route[] = [];
  #pre?: PreHooks;
  #post?: PostHooks;
  currentIndex = $state<number>();
  current = $derived<Route>(this.routes[this.currentIndex]);
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
      const { routeIndex } = this.get(currentPath);
      this.currentIndex = routeIndex;
    }
    this.#pre = pre;
    this.#post = post;
  }

  /**
   * Get the route for a given path.
   * @returns { Route } The route for the given path.
   */
  get(path: string): { route: Route; routeIndex: number } | undefined {
    let route: Route | undefined;
    let routeIndex: number | undefined;

    let pathToMatch = path;
    if (this.basePath && this.basePath !== "/") {
      pathToMatch = path.replace(this.basePath, "");
    }
    // If the path is the root path, return the root route:
    if (pathToMatch === "/") {
      routeIndex = this.routes.findIndex((route) => route.path === "/");
    }

    // Split the path into the first segment and the rest:
    const [first, ...rest] = pathToMatch.replace(/^\//, "").split("/");
    routeIndex = this.routes.findIndex((route) => route.path === first);

    route = routeIndex !== undefined ? this.routes[routeIndex] : undefined;

    // If the route is not found, try to find a route that matches at least part of the path:
    if (!route) {
      for (let i = 0; i < this.routes.length; i++) {
        const r = this.routes[i];
        const regexp = new RegExp(r.path);
        const match = regexp.exec(path);
        if (match) {
          route = { ...r, params: match.groups || match.slice(1) };
          routeIndex = i;
          break;
        }
      }
    }

    return { route, routeIndex };
  }

  /**
   * Navigates to a given route, running  the pre and post hooks.
   * @param {number} routeIndex The route index to navigate to.
   * @returns {Promise<void>}
   */
  async run(routeIndex: number): Promise<void> {
    const route = this.routes[routeIndex];
    this.navigating = true;

    // First, run the global pre hooks.
    if (this.#pre) {
      if (Array.isArray(this.#pre)) {
        for (const pre of this.#pre) {
          this.currentIndex = await pre(route);
        }
      } else {
        this.currentIndex = await this.#pre(route);
      }
    }

    // Then, run the route specific pre hooks.
    if (route?.pre) {
      if (Array.isArray(route.pre)) {
        for (const pre of route.pre) {
          const r = await pre(route);
          if (r !== undefined) {
            this.currentIndex = r;
          }
        }
      } else {
        const r = await route.pre(route);
        if (r !== undefined) {
          this.currentIndex = r;
        }
      }
    }

    // Then, set the current route and given `current` is
    // a reactive $state() variable, it will trigger a render:
    this.currentIndex = routeIndex;

    // Run the route specific post hooks:
    if (route?.post) {
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

    if (this.currentIndex === routeIndex) {
      this.navigating = false;
    }
  }
}

/**
 * Sets up a new history watcher for a router instance.
 * @param {Instance} instance The router instance to setup the history watcher for.
 */
export const setupHistoryWatcher = (instance: Instance) => {
  const { pushState, replaceState } = window.history;

  if (!(window.history as any)._listenersAdded) {
    // Override pushState to dispatch a custom event
    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      window.dispatchEvent(new Event("pushState"));
    };

    // Override replaceState to dispatch a custom event
    window.history.replaceState = function (...args) {
      replaceState.apply(window.history, args);
      window.dispatchEvent(new Event("replaceState"));
    };

    // Listen for custom pushState and replaceState events
    window.addEventListener("pushState", () => {
      instance.run(instance.get(location.pathname).routeIndex);
    });

    window.addEventListener("replaceState", () => {
      instance.run(instance.get(location.pathname).routeIndex);
    });

    // Listen for popstate event to detect forward and backward navigation
    window.addEventListener("popstate", () => {
      instance.run(instance.get(location.pathname).routeIndex);
    });

    (window.history as any)._listenersAdded = true;
  }
};
