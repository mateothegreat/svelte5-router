import { Query, registry, RouterInstanceConfig, Span, type ApplyFn, type Hooks } from ".";
import { Route, RouteResult } from "./route.svelte";
import { StatusCode } from "./statuses";
import { execute } from "./utilities.svelte";

import { SuccessfulConditions } from "./helpers/evaluators";
import { normalize } from "./helpers/normalize";
import { createSpan } from "./helpers/tracing.svelte";
import { urls } from "./helpers/urls";

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

  /**
   * The handler for the hashchange event.
   */
  hashChangeHandler: () => void;
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
  routes = new Set<Route>();

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
    this.applyFn = applyFn;

    this.handlers = {
      pushStateHandler: () => this.handleStateChange(location.toString()),
      replaceStateHandler: () => this.handleStateChange(location.toString()),
      popStateHandler: () => this.handleStateChange(location.toString()),
      hashChangeHandler: () => this.handleStateChange(location.toString())
    };

    window.addEventListener("pushState", this.handlers.pushStateHandler);
    window.addEventListener("replaceState", this.handlers.replaceStateHandler);
    window.addEventListener("popstate", this.handlers.popStateHandler);
    window.addEventListener("hashchange", this.handlers.hashChangeHandler);

    for (let route of config.routes) {
      this.routes.add(
        new Route({
          ...route,
          // path: route.basePath ? `${route.basePath}${route.path}` : route.path,
          /**
           * If the route has no base path (because it's optional), use
           * the router instance's base path.
           */
          basePath: route.basePath || this.config.basePath
        })
      );
    }
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
  async handleStateChange(url: string, span?: Span): Promise<void> {
    const { path, query } = urls.parse(url);
    this.navigating = true;

    if (!span) {
      span = createSpan("detected history change event");
    }
    span?.trace({
      prefix: "🔍",
      name: "router-instance.handleStateChange",
      description: `attempting to handle a new state change for path "${path}"`,
      metadata: {
        router: {
          id: this.config.id,
          basePath: this.config.basePath
        },
        location: "/src/lib/router-instance.svelte:handleStateChange()",
        basePath: this.config.basePath,
        path,
        query: query?.params || false
      }
    });

    const result = await this.get(path, query, span);

    if (result && SuccessfulConditions.includes(result.result.path.condition)) {
      span?.trace({
        prefix: "✅",
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
        if (!(await this.evaluateHooks(result, this.config.hooks.pre))) {
          this.navigating = false;
          return;
        }
      }

      // Run the route specific pre hooks:
      if (result.route?.hooks?.pre) {
        if (!(await this.evaluateHooks(result, result.route.hooks.pre))) {
          this.navigating = false;
          return;
        }
      }

      // Contact the downstream router component to apply the route:
      this.applyFn(result, span);

      // Run the route specific post hooks:
      if (result && result.route?.hooks?.post) {
        if (!(await this.evaluateHooks(result, result.route.hooks.post))) {
          this.navigating = false;
          return;
        }
      }

      // Finally, run the global post hooks:
      if (this.config.hooks?.post) {
        await this.evaluateHooks(result, this.config.hooks.post);
      }

      this.current = result;
    }

    this.navigating = false;
  }

  async evaluateHooks(route: RouteResult, hooks: Hooks): Promise<boolean> {
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
    path = path.replace("/#", "");
    const normalized = normalize(path.replace(this.config.basePath || "/", ""));
    const renderDefaultRoute = (reason: string): RouteResult => {
      const defaultRoute = Array.from(this.routes).find(
        (route) => !route.path || route.path === "" || route.path === "/"
      );
      span?.trace({
        prefix: defaultRoute ? "✅" : "❌",
        name: "router-instance.getDefaultRoute",
        description: `get default route because "${reason}"`,
        metadata: {
          location: "/src/lib/router-instance.svelte:get()",
          router: {
            id: this.config.id,
            basePath: this.config.basePath
          },
          path,
          query,
          normalized,
          route: defaultRoute
        }
      });
      if (defaultRoute) {
        return new RouteResult({
          router: this,
          route: defaultRoute,
          result: {
            path: {
              condition: "default-match",
              original: path
            },
            querystring: {
              condition: "permitted-no-conditions",
              original: query?.toJSON(),
              params: query?.toJSON()
            },
            component: defaultRoute.component,
            status: StatusCode.OK
          }
        });
      }
    };

    span?.trace({
      prefix: "🔍",
      name: "router-instance.get",
      description: `${this.config.id} with base path "${this.config.basePath || "/"}" is attempting to get a route for path "${path}"`,
      metadata: {
        location: "/src/lib/router-instance.svelte:get()",
        router: {
          id: this.config.id,
          basePath: this.config.basePath
        },
        path,
        query,
        normalized
      }
    });

    if (this.config.basePath === path) {
      return renderDefaultRoute("base path is the same as the path");
    }

    let candidate: RouteResult;

    /**
     * Now we check for router nesting:
     */
    for (const route of this.routes) {
      const pathEvaluation = route.test(normalized);
      if (pathEvaluation && SuccessfulConditions.includes(pathEvaluation.condition)) {
        span?.trace({
          prefix: "✅",
          name: "router-instance.get:routesloop",
          description: `${pathEvaluation.condition} for inbound path "${path}"${route.name ? ` (named: "${route.name}")` : ""}`,
          metadata: {
            location: "/src/lib/router-instance.svelte:get():forloop",
            router: {
              id: this.config.id,
              basePath: this.config.basePath
            },
            path,
            query,
            normalized,
            route,
            evaluation: {
              path: pathEvaluation
            }
          }
        });

        if (route.querystring && query) {
          const queryEvaluation = query.test(route.querystring);
          if (SuccessfulConditions.includes(queryEvaluation?.condition)) {
            span?.trace({
              prefix: "✅",
              name: "router-instance.get.evaluateQuery",
              description: `${queryEvaluation?.condition} evaluating querystring "${query?.toString()}" for the route "${path}"${route.name ? ` (named: "${route.name}")` : ""}`,
              metadata: {
                location: "/src/lib/router-instance.svelte:get()",
                router: {
                  id: this.config.id,
                  basePath: this.config.basePath
                },
                path,
                query,
                normalized,
                evaluation: {
                  path: pathEvaluation,
                  querystring: queryEvaluation
                }
              }
            });
            candidate = new RouteResult({
              router: this,
              route,
              result: {
                path: {
                  ...pathEvaluation,
                  original: normalized
                },
                querystring: {
                  ...queryEvaluation,
                  original: query.toJSON()
                },
                component: route.component,
                status: StatusCode.OK
              }
            });
          }
        } else {
          /**
           * No querystring is configured for this route, so we will
           * use the querystring from the inbound path.
           */
          candidate = new RouteResult({
            router: this,
            route,
            result: {
              path: {
                ...pathEvaluation,
                original: normalized
              },
              querystring: {
                condition: "permitted-no-conditions",
                original: query?.toJSON(),
                params: query?.toJSON()
              },
              component: route.component,
              status: StatusCode.OK
            }
          });
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
    if (!candidate && this.config.statuses?.[404]) {
      const status = this.config.statuses[404];
      if (typeof status === "function") {
        return {
          result: {
            ...status(
              {
                router: this,
                result: {
                  path: {
                    condition: "permitted-no-conditions",
                    original: path
                  },
                  querystring: {
                    condition: "permitted-no-conditions",
                    original: query?.toJSON(),
                    params: query?.toJSON()
                  },
                  status: StatusCode.NotFound
                }
              },
              span
            ),
            path: {
              condition: "permitted-no-conditions",
              original: path
            },
            querystring: {
              condition: "permitted-no-conditions",
              original: query?.toJSON(),
              params: query?.toJSON()
            },
            status: StatusCode.NotFound
          },
          router: this
        };
      } else {
        return {
          result: {
            ...(status as object),
            path: {
              condition: "permitted-no-conditions",
              original: path
            },
            querystring: {
              condition: "permitted-no-conditions",
              original: query?.toJSON(),
              params: query?.toJSON()
            },
            status: StatusCode.NotFound
          },
          router: this
        };
      }
    }

    return candidate;
  }

  /**
   * Deregister a router instance by removing it from the registry and
   * restoring the original history methods.
   *
   * This is called when a router instance is removed from the DOM
   * triggered by the `onDestroy` lifecycle method of the router instance.
   */
  deregister(span?: Span): void {
    window.removeEventListener("pushState", this.handlers.pushStateHandler);
    window.removeEventListener("replaceState", this.handlers.replaceStateHandler);
    window.removeEventListener("popstate", this.handlers.popStateHandler);
    window.removeEventListener("hashchange", this.handlers.hashChangeHandler);

    registry.deregister(this.config.id, span);
  }
}
