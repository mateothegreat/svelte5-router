import { Query, registry, RouterInstanceConfig, Span, type ApplyFn, type Hooks } from ".";
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
  current = $state<RouteResult>();

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

    const result = await this.get(path, query, span);
    if (result) {
      span?.trace({
        name: "router-instance.handleStateChange",
        description: `route found for path "${path}"`,
        metadata: {
          location: "/src/lib/router-instance.svelte:handleStateChange()",
          router: {
            id: this.config.id,
            basePath: this.config.basePath
          },
          path,
          query: query?.params || false,
          route: result
        }
      });

      // Run the global pre hooks:
      if (this.config.hooks?.pre) {
        if (!(await this.evaluateHooks(result.route, this.config.hooks.pre))) {
          this.navigating = false;
          return;
        }
      }

      // Run the route specific pre hooks:
      if (result.route.hooks?.pre) {
        if (!(await this.evaluateHooks(result.route, result.route.hooks.pre))) {
          this.navigating = false;
          return;
        }
      }

      // Contact the downstream router component to apply the route:
      this.applyFn(result, span);

      // Run the route specific post hooks:
      if (result && result.route.hooks?.post) {
        if (!(await this.evaluateHooks(result.route, result.route.hooks.post))) {
          this.navigating = false;
          return;
        }
      }

      // Finally, run the global post hooks:
      if (this.config.hooks?.post) {
        await this.evaluateHooks(result.route, this.config.hooks.post);
      }

      this.current = result;
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
  async get(path: string, query?: Query, span?: Span): Promise<RouteResult> {
    const normalized = normalize(path.replace(this.config.basePath || "/", ""));

    const renderDefaultRoute = (reason: string): RouteResult => {
      const defaultRoute = Array.from(this.routes).find(
        (route) => !route.path || route.path === "" || route.path === "/"
      );
      span?.trace({
        name: "router-instance.getDefaultRoute",
        description: `get default route because "${reason}"`,
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
          router: this,
          route: defaultRoute,
          result: {
            path: {
              condition: "default-match",
              original: path
            },
            querystring: {
              condition: "no-conditions",
              original: query?.toString(),
              params: query?.params
            },
            component: defaultRoute.component,
            status: StatusCode.OK
          }
        };
      }
    };

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

    if (this.config.basePath === path) {
      return renderDefaultRoute("base path is the same as the path");
    }

    let candidate: RouteResult;

    for (const route of this.routes) {
      const pathEvaluation = route.test(normalized);
      if (pathEvaluation && SuccessfulConditions.includes(pathEvaluation.condition)) {
        span?.trace({
          name: "router-instance.get:routesloop",
          description: `${pathEvaluation.condition} for inbound path "${path}"${route.name ? ` (named: "${route.name}")` : ""}`,
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
            evaluation: {
              path: pathEvaluation
            }
          }
        });

        if (route.query && query) {
          const queryEvaluation = query.test(route.query);
          span?.trace({
            name: "router-instance.get.evaluateQuery",
            description: `evaluating query string "${query?.toString()}" ${SuccessfulConditions.includes(queryEvaluation?.condition) ? "passed" : "failed"} for the route "${path}"`,
            metadata: {
              location: "/src/lib/router-instance.svelte:get()",
              router: {
                id: this.config.id,
                basePath: this.config.basePath
              },
              path,
              query: query?.params || false,
              normalized,
              evaluation: {
                path: pathEvaluation,
                querystring: queryEvaluation
              }
            }
          });
          if (SuccessfulConditions.includes(queryEvaluation?.condition)) {
            candidate = {
              router: this,
              route,
              result: {
                path: {
                  condition: "exact-match",
                  ...pathEvaluation,
                  original: normalized
                },
                querystring: {
                  condition: "exact-match",
                  ...queryEvaluation,
                  original: query?.toString()
                },
                component: route.component,
                status: StatusCode.OK
              }
            };
          }
        } else {
          candidate = {
            router: this,
            route,
            result: {
              path: {
                ...pathEvaluation,
                original: normalized
              },
              querystring: {
                condition: "no-conditions",
                original: query?.toString() || "",
                params: query?.params || {}
              },
              component: route.component,
              status: StatusCode.OK
            }
          };
        }
      }
    }

    /**
     * If we've made it this far, we should default to trying to find
     * a route that has no path configured. This will be treated as
     * the "default" route:
     */
    if (path === "/") {
      return renderDefaultRoute("no routes match, last resort is to find a default route");
    }

    /**
     * We've exhaausted all options, so we will attempt to locate
     * a 404 route from the statuses configuration applied to this
     * router instance.
     */
    if (this.config.statuses?.[404]) {
      const status = this.config.statuses[404];
      if (typeof status === "function") {
        const ret = (status as (path: string, query?: Query) => Route)(normalized, query);
        candidate = {
          router: this,
          route: {
            ...ret,
            path: normalized
          },
          result: {
            path: {
              condition: "no-conditions",
              original: path
            },
            querystring: {
              condition: "no-conditions",
              original: query?.toString() || "",
              params: query?.params || {}
            },
            component: ret.component,
            status: StatusCode.NotFound
          }
        };
      } else {
        candidate = {
          router: this,
          route: {
            path: normalized
          },
          result: {
            path: {
              condition: "no-match",
              original: path
            },
            querystring: {
              condition: "no-match",
              original: query?.toString() || ""
            },
            component: status,
            status: StatusCode.NotFound
          }
        };
      }
    }

    return candidate;
  }
}
