import { type Component } from 'svelte';

import type { PostHooks, PreHooks } from './hooks';
import { logger } from './logger';
import { normalizePath } from './paths';
import { registry } from './registry.svelte';
import { Route } from './route.svelte';

/**
 * The configuration for a router instance.
 */
export class InstanceConfig {
  /**
   * The base path for the router instance.
   *
   * @optional If no value is provided, the base path will be "/".
   */
  basePath?: string;

  /**
   * The routes for the router instance.
   *
   * @type {Route[]}
   */
  routes: Route[] = [];

  /**
   * The pre hooks for the router instance.
   *
   * @optional If no value is provided, no pre hooks will be run.
   */
  pre?: PreHooks;

  /**
   * The post hooks for the router instance.
   *
   * @optional If no value is provided, no post hooks will be run.
   */
  post?: PostHooks;

  /**
   * The initial path for the router instance.
   *
   * @optional If no value is provided, the initial path will be the current path of the browser.
   */
  initialPath?: string;

  /**
   * The not found component for the router instance.
   *
   * @optional If no value is provided and no route could be found,
   * the router will will not render anything.
   */
  notFoundComponent?: Component;

  /**
   * The children for the router instance.
   *
   * @type {Route[]}
   */
  children?: Route[];

  /**
   * The constructor for this router instance.
   *
   * @param {InstanceConfig} config The config for this router instance.
   */
  constructor(config: InstanceConfig) {
    this.basePath = config.basePath;
    this.pre = config.pre;
    this.post = config.post;
    this.initialPath = config.initialPath;
    this.notFoundComponent = config.notFoundComponent;

    /**
     * For safety, determine if the routes are already instances of the Route class
     * and if not, create a new instance of the Route class:
     */
    for (let route of config.routes) {
      if (route instanceof Route) {
        this.routes.push(route);
      } else {
        this.routes.push(new Route(new Route(route)));
      }
    }
  }
}

/**
 * A router instance that each <Router/> component creates.
 *
 * This is the reference that is exposed and observable by the caller
 * of the <Router/> component such as:
 *
 *  @example
 * ```svelte
 * <script lang="ts">
 *   let instance = $state<Instance>();
 * </script>
 *
 * <Router
 *  bind:instance
 *  {routes}
 *  pre={globalAuthGuardHook}
 *  post={globalLoggerPostHook}
 *  notFoundComponent={NotFound} />
 *
 * <div>
 *   Current Path: {instance.current.path}
 *   Navigating: {instance.navigating}
 * </div>
 * ```
 */
export class Instance {
  /**
   * The unique identifier for the router instance.
   *
   * @type {string}
   *
   * @default Defaults to a random string of characters.
   */
  id = Math.random().toString(36).substring(2, 15);

  /**
   * The current route having been set when a route has been navigated to.
   *
   * @type {Route}
   *
   * @default null
   */
  current = $state<Route>(null);

  /**
   * Whether the router is navigating to a new route.
   *
   * This is exposed to the outside so that we can use it to
   * determine if the router is currently navigating to a new route.
   *
   * @defaultValue `false`
   */
  navigating = $state(false);

  /**
   * The configuration for this router instance.
   */
  config: InstanceConfig;

  /**
   * Creates a new router instance.
   *
   * @param {InstanceConfig} config The configuration for this router instance.
   */
  constructor(config: InstanceConfig) {
    this.config = config;

    /**
     * If a current path is provided, find the route that matches the `initialPath`
     * and set the current route to that route.
     *
     * This is typically caused when a page is refreshed or initially loaded.
     */
    if (config.initialPath) {
      const route = this.get(config.initialPath);
      if (route) {
        route.active = true;
        this.current = route;
      }
    } else {
      this.current = this.get(location.pathname);
      if (this.current) {
        this.current.active = true;
      }
    }

    /**
     * When the router instance is created we need to run the current route
     * to ensure that the router is in the correct state.
     *
     * This is typically caused when a page is refreshed or initially loaded.
     */
    // this.run(this.current);

    /**
     * Register the router instance with the RouterRegistry and
     * add event listeners for the pushState, replaceState, and popstate events.
     */
    const handlers = registry.register(this);
    const { pushState, replaceState } = window.history;

    window.addEventListener("pushState", handlers.pushStateHandler);
    window.addEventListener("replaceState", handlers.replaceStateHandler);
    window.addEventListener("popstate", handlers.popStateHandler);

    /**
     * Override the pushState and replaceState methods to
     * dispatch the pushState and replaceState events.
     */
    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      window.dispatchEvent(new Event("pushState"));
    };
    window.history.replaceState = function (...args) {
      replaceState.apply(window.history, args);
      window.dispatchEvent(new Event("replaceState"));
    };

  }

  /**
   * Find a matching route for a given path checking if the path is a string or a RegExp.
   *
   * @param {string} path The path to find a matching route for.
   * @returns {Route | undefined} The matching route (if found).
   */
  get(path: string): Route | undefined {
    let route: Route;
    let normalizedPath = normalizePath(path);

    /**
     * Handle base path by removing it from the normalizedPath:
     */
    if (this.config.basePath && this.config.basePath !== "/") {
      normalizedPath = normalizedPath.replace(this.config.basePath, "");
    }

    /**
     * Split path into segments, removing empty strings:
     */
    const segments = normalizedPath.split('/').filter(Boolean);

    /**
     * Iterate over the routes and find the matching route:
     */
    for (const r of this.config.routes) {
      const routePath = typeof r.path === "string"
        ? r.path.replace(/^\//, "")
        : r.path;

      if (segments.length === 0 || normalizedPath === "/") {
        if (!routePath || routePath === "/" || routePath === "") {
          route = r;
          route.status = 200;
        }
        continue;
      }

      const routeable = r.test(normalizedPath, this.config.basePath);
      if (routeable) {
        r.params = routeable.params;
        r.remaining = routeable.remaining;
        return r;
      }

      // Check for nested route match:
      // if (routePath === firstSegment) {
      //   const remainingSegments = segments.slice(1);
      //   const remainingPath = remainingSegments.length
      //     ? '/' + remainingSegments.join('/')
      //     : '/';

      //   console.log("rasadf", remainingPath)
      //   return {
      //     ...r,
      //     params: remainingSegments,
      //     remaining: remainingPath
      //   };
      // }

      if (r.test(normalizedPath, this.config.basePath)) {
        route = r;
        route.status = 200;
        route.active = true;
      }
    }

    if (!route) {
      if (this.config.notFoundComponent) {
        route = {
          path: "/404",
          component: this.config.notFoundComponent,
          status: 404
        };
      } else {
        route = {
          path,
          status: 404
        }
      }
    }

    /**
     * This allows us to log when we're in debug mode otherwise
     * this statement is removed by the compiler (tree-shaking):
     */
    if (import.meta.env.SPA_ROUTER && import.meta.env.SPA_ROUTER.logLevel === "debug") {
      logger.debug(this.id, `trying to get("${normalizedPath}")`, {
        status: route?.status,
        trying: route.path,
        upstream: this.config.basePath || "",
        downstream: normalizedPath,
      });
    }

    return route;
  }

  /**
   * Navigates to a given route, running  the pre and post hooks.
   *
   * @param {Route} route The route to navigate to.
   * @returns {Promise<void>}
   */
  async run(route: Route): Promise<void> {
    this.navigating = true;

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
    // if (route.path !== this.current?.path) {
    //   console.log("xxxxxxxsetting current", route.path, this.current?.path)
    // }

    // if (route.path === this.current.path) {
    //   console.log('resetting')
    //   this.current = null;
    // }
    //
    // console.log("setting current", this.id, route.path, this.current?.path)
    // const clonedRoute = Object.assign({}, route);
    if (route.path === this.current?.path) {
      this.current = null;
    }

    this.current = route;
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
   * Whether the router is currently processing a state change.
   */
  #_processing = false;

  /**
   * Process a state change event.
   *
   * We use a quueing mechanism to ensure that only one state change event
   * is processed at a time.
   *
   * @param {string} path The path to navigate to.
   * @returns {void}
   */
  onStateChange(route: Route): void {
    if (this.#_processing) return;
    this.#_processing = true;

    if (route) {
      this.run(route).finally(() => {
        this.#_processing = false;
      });
    } else {
      this.#_processing = false;
    }

    route.active = true;
  }

  /**
   * Called when the router instance needs to be destroyed
   * (typically when the router instance is removed from the DOM).
   *
   * @returns {void}
   */
  destroy(): void {
    registry.unregister(this.id);
  }
}
