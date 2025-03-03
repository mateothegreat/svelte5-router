import { Query, registry, Routed, RouterInstanceConfig, Span, type ApplyFn, type Hooks } from ".";
import type { Route, RouteResult } from "./route.svelte";
import { StatusCode } from "./statuses";
import { execute } from "./utilities.svelte";

import { SuccessfulConditions } from "./helpers/evaluators";
import { logging } from "./helpers/logging";
import { normalize } from "./helpers/normalize";
import { createSpan } from "./helpers/tracing.svelte";

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
      pushStateHandler: () =>
        this.handleStateChange(
          location.pathname,
          !!window.location.search
            ? new Query(Object.fromEntries(new URLSearchParams(window.location.search)))
            : undefined
        ),
      replaceStateHandler: () =>
        this.handleStateChange(
          location.pathname,
          !!window.location.search
            ? new Query(Object.fromEntries(new URLSearchParams(window.location.search)))
            : undefined
        ),
      popStateHandler: () =>
        this.handleStateChange(
          location.pathname,
          !!window.location.search
            ? new Query(Object.fromEntries(new URLSearchParams(window.location.search)))
            : undefined
        )
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
    window.removeEventListener("replaceState", this.handlers.replaceStateHandler);
    window.removeEventListener("popstate", this.handlers.popStateHandler);

    if (import.meta.env.SPA_ROUTER && import.meta.env.SPA_ROUTER.logLevel === "debug") {
      logging.debug(this.config.id, "unregistered router instance", {
        id: this.config.id,
        routes: this.routes.size
      });
    }

    registry.unregister(this.config.id);
  }

  /**
   * Process a state change event from the browser history API.
   *
   * This method is called when the browser history API is used to change the
   * current route via the `pushState`, `replaceState`, or `popState` methods.
   *
   * The method will evaluate the route for the given path and query, and apply
   * the route to the router instance to ultimately call the `applyFn` function
   * on the downstream router component to render the new route.
   *
   * @param {string} path The path to handle the state change for.
   * @param {Query} query The query to handle the state change for.
   * @param {Span} span @optional The span to attach traces to. If not provided,
   * a new span will be created.
   */
  async handleStateChange(path: string, query: Query, span?: Span): Promise<void> {
    this.navigating = true;

    if (this.config.renavigation) {
    }

    if (!span) {
      span = createSpan("detected history change event");
    }
    span?.trace({
      name: "router-instance.handleStateChange",
      description: `${this.config.id} with base path "${this.config.basePath || "/"}" is attempting to handle a new state change for path "${path}"`,
      metadata: {
        location: "/src/lib/router-instance.svelte:handleStateChange()",
        basePath: this.config.basePath,
        path,
        query: query?.params || false
      }
    });

    const route = this.get(path, query, span);
    if (route) {
      span?.trace({
        name: "router-instance.handleStateChange",
        description: `${this.config.id} with base path "${this.config.basePath || "/"}" found an applicable route for path "${path}"`,
        metadata: {
          location: "/src/lib/router-instance.svelte:handleStateChange()",
          router: {
            id: this.config.id,
            basePath: this.config.basePath
          },
          path,
          query: query?.params || false,
          route
        }
      });

      // Run the global pre hooks:
      if (this.config.hooks?.pre) {
        if (!(await this.evaluateHooks(route, this.config.hooks.pre))) {
          this.navigating = false;
          return;
        }
      }

      // Run the route specific pre hooks:
      if (route.hooks?.pre) {
        if (!(await this.evaluateHooks(route, route.hooks.pre))) {
          this.navigating = false;
          return;
        }
      }

      // Contact the downstream router component to apply the route:
      this.applyFn(route.component, new Routed(route, route.evaluation), span);

      // Run the route specific post hooks:
      if (route && route.hooks?.post) {
        if (!(await this.evaluateHooks(route, route.hooks.post))) {
          this.navigating = false;
          return;
        }
      }

      // Finally, run the global post hooks:
      if (this.config.hooks?.post) {
        await this.evaluateHooks(route, this.config.hooks.post);
      }

      this.current = route;
    }
    this.navigating = false;
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
   * Retrieve a route for a given path.
   *
   * @param {string} path The path to get the route for.
   *
   * @returns {RegistryMatch} The matched route for the given path.
   */
  get(path: string, query?: Query, span?: Span): RouteResult {
    const normalized = normalize(path.replace(this.config.basePath || "/", ""));
    span?.trace({
      name: "router-instance.get",
      description: `${this.config.id} with base path "${this.config.basePath || "/"}" is attempting to get a route for path "${path}"`,
      metadata: {
        location: "/src/lib/router-instance.svelte:get()",
        router: {
          id: this.config.id,
          basePath: this.config.basePath
        },
        path,
        query: query?.params || false,
        normalized
      }
    });

    // If the path is empty, return the default route:
    if (normalized.length === 0) {
      const defaultRoute = this.getDefaultRoute();
      span?.trace({
        name: "router-instance.getDefaultRoute",
        description: "get default route",
        metadata: {
          location: "/src/lib/router-instance.svelte:get()",
          router: {
            id: this.config.id,
            basePath: this.config.basePath
          },
          path,
          query: query?.params || false,
          normalized,
          route: defaultRoute
        }
      });
      if (defaultRoute) {
        return {
          ...defaultRoute,
          path: normalized,
          status: StatusCode.OK,
          evaluation: {
            path: {
              condition: "default-match"
            },
            querystring: {
              condition: "skipped-not-present"
            }
          }
        };
      }
    }

    for (const route of this.routes) {
      const evaluation = route.test(normalized);
      if (evaluation && SuccessfulConditions.includes(evaluation?.path?.condition)) {
        span?.trace({
          name: "router-instance.get:routesloop",
          description: `${evaluation.path.condition} for inbound path "${path}" against route.path "${route.path}"${route.name ? ` (name: "${route.name}")` : ""}`,
          metadata: {
            location: "/src/lib/router-instance.svelte:get():forloop",
            router: {
              id: this.config.id,
              basePath: this.config.basePath
            },
            path,
            query: query?.params || false,
            normalized,
            route,
            evaluation
          }
        });

        if (route.query && query) {
          if (route.path === normalized) {
            const matches = query.test(route.query);
            span?.trace({
              name: "router-instance.get.evaluateQuery",
              description: `evaluating the query string for the route "${route.path}"`,
              metadata: {
                location: "/src/lib/router-instance.svelte:get()",
                router: {
                  id: this.config.id,
                  basePath: this.config.basePath
                },
                path,
                query: query?.params || false,
                normalized,
                evaluation: matches
              }
            });
            if (matches) {
              route.params = matches;
              route.status = StatusCode.OK;
              return {
                ...route,
                evaluation
              };
              // } else {
              //   if (this.config.statuses?.[404]) {
              //     if (typeof this.config.statuses[404] === "function") {
              //       return {
              //         ...(this.config.statuses[404] as (path: string) => Route)(path),
              //         status: StatusCode.Forbidden,
              //         path,
              //         query: query.params,
              //         props: route.props
              //       };
              //     }
              //     // If the status is a component, return the route:
              //     return {
              //       component: this.config.statuses[404],
              //       status: StatusCode.NotFound
              //     };
              //   }
            }
          }
          // } else {
          //   route.status = StatusCode.OK;
          //   route.query = query?.params;
          //   console.log("route", route);
          //   return {
          //     ...route,
          //     path: normalized,
          //     query: query?.params,
          //     evaluation: {
          //       path: "exact-match",
          //       querystring: "skipped-not-present"
          //     }
          //   };
        } else {
          return {
            ...route,
            path: normalized,
            status: StatusCode.OK,
            evaluation
          };
        }
      }
    }

    throw new Error("No route found");

    // // No route matches, try to return a 404 route:
    // if (this.config.statuses?.[404]) {
    //   const status = this.config.statuses[404];
    //   if (typeof status === "function") {
    //     const ret = (status as (path: string, query?: Query) => Route)(normalized, query);
    //     console.log("ret", ret, 1, query, 2, normalized);
    //     return {
    //       ...ret,
    //       path: normalized,
    //       status: StatusCode.NotFound
    //     };
    //   }
    //   return {
    //     component: status,
    //     status: StatusCode.NotFound
    //   };
    // }
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
}
