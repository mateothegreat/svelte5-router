import type { Component, Snippet } from 'svelte';

import { logger } from './logger';
import { RouterRegistry } from './registry';

/**
 * A pre hook that can be used to modify the route before it is navigated to.
 */
export type PreHooks = ((route: Route) => Route)[] | ((route: Route) => Promise<Route>)[] | ((route: Route) => void) | ((route: Route) => Route) | ((route: Route) => Promise<Route>);

/**
 * A post hook that can be used to modify the route after it is navigated to.
 */
export type PostHooks = ((route: Route) => void)[] | ((route: Route) => Promise<void>)[] | ((route: Route) => void) | ((route: Route) => Promise<void>);

/**
 * A route that can be navigated to.
 */
export class Route {
  path: RegExp | string | number;
  component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;
  props?: Record<string, any>;
  pre?: PreHooks;
  post?: PostHooks;
  children?: Route[];
  params?: string[] | Record<string, string>;
  remainingPath?: string;
  #active = $state(false);

  constructor(route: Route) {
    this.path = route.path;
    this.component = route.component;
    this.props = route.props;
    this.pre = route.pre;
    this.post = route.post;
  }

  /**
   * Set the active state of the route.
   * @param {boolean} active The active state of the route.
   */
  setActive(active: boolean) {
    this.#active = active;
  }

  active() {
    return this.#active;
  }
}

export class InstanceConfig {
  basePath?: string;
  routes: Route[];
  pre?: PreHooks;
  post?: PostHooks;
  currentPath?: string;
  notFoundComponent?: Component;

  constructor(config: InstanceConfig) {
    this.basePath = config.basePath;
    this.routes = config.routes;
    this.pre = config.pre;
    this.post = config.post;
    this.currentPath = config.currentPath;
    this.notFoundComponent = config.notFoundComponent;
  }
}
/**
 * A router instance that each <Router/> component creates.
 */
export class Instance {
  /**
   * The unique identifier for the router instance.
   */
  id = Math.random().toString(36).substring(2, 15);

  /**
   * The current route.
   */
  current = $state<Route>();

  /**
   * Whether the router is navigating to a new route.
   */
  navigating = $state(false);

  /**
   * The configuration for this router instance.
   */
  config: InstanceConfig;

  /**
   * Creates a new router instance.
   * @param {InstanceConfig} config The configuration for this router instance.
   */
  constructor(config: InstanceConfig) {
    this.config = config;

    // If a current path is provided, set the current route to the
    // route that matches the current path.
    if (config.currentPath) {
      this.current = this.get(config.currentPath);
      this.run(this.current);
    }

    const { pushState, replaceState } = window.history;

    const handlers = RouterRegistry.register(this);

    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      window.dispatchEvent(new Event("pushState"));
    };

    window.history.replaceState = function (...args) {
      replaceState.apply(window.history, args);
      window.dispatchEvent(new Event("replaceState"));
    };

    window.addEventListener("pushState", handlers.pushStateHandler);
    window.addEventListener("replaceState", handlers.replaceStateHandler);
    window.addEventListener("popstate", handlers.popStateHandler);
  }

  /**
   * Find a matching route for a given path checking if the path is a string or a RegExp.
   * @param {string} path The path to find a matching route for.
   * @returns {Route | undefined} The matching route (if found).
   */
  get(path: string): Route | undefined {
    // Normalize the input path:
    const normalizedPath = path.startsWith('/') ? path : '/' + path;

    // Handle base path
    let pathToMatch = normalizedPath;
    if (this.config.basePath && this.config.basePath !== "/") {
      const basePathRegex = new RegExp(`^${this.config.basePath}`);
      pathToMatch = normalizedPath.replace(basePathRegex, "");
    }

    // This allows us to log when we're in debug mode otherwise
    // this statement is removed by the compiler (tree-shaking):
    if (import.meta.env.SPA_ROUTER && import.meta.env.SPA_ROUTER.logLevel === "debug") {
      logger.debug(this.id, `trying to get("${path}")`, {
        upstream: this.config.basePath || "",
        downstream: pathToMatch,
      });
    }

    // Split path into segments, removing empty strings:
    const segments = pathToMatch.split('/').filter(Boolean);
    const firstSegment = segments[0];

    for (const r of this.config.routes) {
      // Normalize the route path:
      const routePath = typeof r.path === "string"
        ? r.path.replace(/^\//, "")
        : r.path;

      // Handle root path:
      if (!segments.length || pathToMatch === "/") {
        if (!routePath || routePath === "/" || routePath === "") {
          return { ...r, params: {} };
        }
        continue;
      }

      if (typeof routePath === "string") {
        // Check for exact match:
        const routeSegments = routePath.split('/').filter(Boolean);
        if (routeSegments.join('/') === segments.join('/')) {
          return { ...r, params: {} };
        }

        // Check for nested route match:
        if (routePath === firstSegment) {
          const remainingSegments = segments.slice(1);
          const remainingPath = remainingSegments.length
            ? '/' + remainingSegments.join('/')
            : '/';

          return {
            ...r,
            params: remainingSegments,
            remainingPath
          };
        }

        // Handle possible regex routes:
        const hasRegexSyntax = /[[\]{}()*+?.,\\^$|#\s]/.test(routePath);
        if (hasRegexSyntax) {
          const match = new RegExp(`^${routePath}$`).exec(segments.join('/'));
          if (match) {
            return { ...r, params: match.groups || match.slice(1) };
          }
        }
      } else if (routePath instanceof RegExp) {
        const match = routePath.exec(segments.join('/'));
        if (match) {
          return { ...r, params: match.groups || match.slice(1) };
        }
      }
    }

    if (this.config.notFoundComponent) {
      return {
        path: "/404",
        component: this.config.notFoundComponent
      };
    }
  }

  /**
   * Navigates to a given route, running  the pre and post hooks.
   * @param {Route} route The route to navigate to.
   * @returns {Promise<void>}
   */
  async run(route: Route): Promise<void> {
    this.navigating = true;

    // First, run the global pre hooks
    if (this.config.pre) {
      if (Array.isArray(this.config.pre)) {
        for (const pre of this.config.pre) {
          const result = await pre(route);
          if (result) route = result;
        }
      } else {
        const result = await this.config.pre(route);
        if (result) route = result;
      }
    }

    // Then, run the route specific pre hooks
    if (route.pre) {
      if (Array.isArray(route.pre)) {
        for (const pre of route.pre) {
          const result = await pre(route);
          if (result) route = result;
        }
      } else {
        const result = await route.pre(route);
        if (result) route = result;
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
    if (this.config.post) {
      if (Array.isArray(this.config.post)) {
        for (const post of this.config.post) {
          await post(route);
        }
      } else {
        await this.config.post(route);
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
    if (this._processing) return;
    this._processing = true;

    const route = this.get(path);
    if (route) {
      this.run(route).finally(() => {
        this._processing = false;
      });
    } else {
      this._processing = false;
    }
  }

  private _processing = false;

  /**
   * Destroy the router instance.
   * @returns {void}
   */
  destroy(): void {
    RouterRegistry.unregister(this.id);
  }
}
