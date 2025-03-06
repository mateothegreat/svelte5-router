import type { Component, Snippet } from "svelte";

import type { Hook, Hooks } from "./hooks";
import { paths, type PathType } from "./path";
import { Query } from "./query.svelte";
import type { RouterInstance } from "./router-instance.svelte";

import { evaluators, type Condition, type Evaluation } from "./helpers/evaluators";
import { Identities } from "./helpers/identify";
import { marshal } from "./helpers/marshal";
import { normalize } from "./helpers/normalize";
import { regexp } from "./helpers/regexp";
import type { Span, Trace } from "./helpers/tracing.svelte";
import { urls, type ReturnParam } from "./helpers/urls";

/**
 * A route result that includes the evaluation results of the route.
 *
 * @remarks
 * This type is necessary for the internal workings of the router to ensure that
 * the evaluation results are included in the route result and to avoid requiring
 * it to be merged in the original route instance.
 */
export class RouteResult {
  router: RouterInstance;
  route?: Route;
  result: {
    path: {
      condition: Condition;
      original: string;
      params?: ReturnParam;
    };
    querystring: {
      condition: Condition;
      original: ReturnParam;
      params?: ReturnParam;
    };
    component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;
    status: number;
  };

  constructor(result: RouteResult) {
    this.router = result.router;
    this.route = result.route;
    this.result = result.result;
  }

  /**
   * The absolute path of the route by combining the router's base path and
   * the route's path.
   */
  absolute?(basePath = this.router.config.basePath): string {
    /**
     * If the router has a base path, we need to combine it with the route's path
     * otherwise it will have "undefined" as the base path and the path will be
     * incorrect:
     */
    if (basePath) {
      return `${basePath}${this.result.path.original}`;
    }
    return this.result.path.original;
  }

  /**
   * The string representation of the route including the querystring.
   */
  toString?(): string {
    return `${this.absolute()}${this.result.querystring.original ? `?${this.result.querystring.original}` : ""}`;
  }
}

/**
 * The function that is used to apply a route to the DOM.
 *
 * @category router
 */
export type ApplyFn = (result: RouteResult, span?: Span) => void;

export type RouteConfig = {
  name?: string | number;
  basePath?: string;
  path?: PathType;
  querystring?: Record<string, ReturnParam>;
  component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;
  props?: Record<string, any>;
  hooks?: {
    pre?: Hooks;
    post?: Hooks;
  };
  children?: RouteConfig[];
  status?: number;
};

/**
 * A route that can be navigated to.
 * @example
 * ```ts
 * const routes: Route[] = [
 *   {
 *     component: Home
 *   },
 *   {
 *      path: "(?<child>.*)",
 *      component: ParseRouteParams
 *   }
 * ]
 * ```
 *
 * @category router
 */
export class Route {
  /**
   * The unique identifier of this route.
   * This is useful if you need to track routes outside of the router's scope.
   *
   * @optional If no value is provided, the route will not have a name.
   */
  name?: string | number;

  /**
   * The base path of the route.
   *
   * This is useful if you want to be declarative about the base path of the route
   * and not depend on the router to determine the base path.
   */
  basePath?: string;

  /**
   * The path of the route to match against the current path.
   *
   * @optional If not provided, the route will match any path
   * as it will be the default route.
   */
  path?: PathType;

  /**
   * The query params of the route.
   *
   * @optional If no value is provided, there are no query params.
   */
  querystring?: Query;

  /**
   * The component to render when the route is active.
   *
   * @optional If no value is provided, the route will not render a component.
   * This is useful if you want to use pre or post hooks to render a component
   * or snippet conditionally.
   */
  component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;

  /**
   * The props to pass to the component.
   *
   * @optional If a value is provided, the component will receive this value in $props().
   */
  props?: Record<string, any>;

  /**
   * Hooks to be run before and after the routes are rendered
   * at the router level (independent of the route hooks if applicable).
   *
   * @optional If no value is provided, no hooks will be run.
   */
  hooks?: {
    pre?: Hook | Hook[];
    post?: Hook | Hook[];
  };

  /**
   * The children routes of the route.
   *
   * This is useful if you want to be declarative about the routes that are direct
   * children of this route and not depend on the router to determine the children
   * when there are multiple <Router/> instances.
   *
   *
   * @optional If no value is provided, there are no direct child routes. Routes may
   * be mapped to children routes by the router when there are multiple <Router/> instances
   * with overlapping `basePath` values.
   *
   * @example
   * ```ts
   * const routes: Route[] = [
   *   ...
   *   {
   *     path: "/users",
   *     children: [
   *       {
   *         path: "/:id",
   *         component: User
   *       }
   *     ]
   *   }
   *   ...
   * ]
   * ```
   */
  children?: Route[];

  /**
   * The status of the route once it has been matched or otherwise processed.
   */
  status?: number;

  /**
   * Traces are a list of objects that describe the route's path and query params
   * as it is processed by the router.
   */
  traces?: Trace[] = $state([]);

  /**
   * The constructor for the `Route` class.
   *
   * @param {Route} config An instance of the `Route` class.
   */
  constructor(config: RouteConfig) {
    this.name = config.name;
    this.basePath = config.basePath;
    this.path = typeof config.path === "string" ? normalize(config.path) : config.path;

    if (config.querystring) {
      this.querystring = new Query(config.querystring);
    }

    this.component = config.component;
    this.props = config.props;
    this.hooks = config.hooks;
    this.status = config.status;
    this.children = config.children?.map((child) => new Route(child));
  }

  /**
   * Parse the route against the given path.
   * @param path The path to parse against the route.
   */
  test?(path: PathType): Evaluation {
    const matcher = urls.path(path.toString());
    // Handle string paths being passed in at the route.path level:
    if (typeof this.path === "string") {
      // Detect if this path contains regex syntax:
      if (regexp.can(this.path)) {
        // Path is a regex, so we need to test it against the path passed in:
        const match = regexp.from(this.path).exec(matcher);
        if (match) {
          return {
            condition: "exact-match",
            params: match.groups
          };
        }
      } else {
        // Path is not a regex, so we then check if the path passed in is a direct match:
        if (this.path === matcher) {
          return {
            condition: "exact-match",
            params: this.path
          };
        } else if (paths.base(this.path, matcher)) {
          return {
            condition: "base-match",
            params: {}
          };
        }
      }
    }
    // Handle RegExp instances being passed in at the route.path level:
    else if (this.path instanceof RegExp) {
      const res = evaluators.any[Identities.regexp](this.path, matcher);
      if (res) {
        return {
          condition: "exact-match",
          params: res
        };
      }
    }
    // Handle numeric paths being passed in at the route.path level:
    else if (typeof this.path === "number" && this.path === marshal(matcher).value) {
      throw new Error("numbered route match not supported at the route.path level");
    }

    return {
      condition: "no-match",
      params: {}
    };
  }

  /**
   * The absolute path of the route by combining the router's base path and
   * the route's path.
   */
  absolute?(): string {
    /**
     * If the router has a base path, we need to combine it with the route's path
     * otherwise it will have "undefined" as the base path and the path will be
     * incorrect:
     */
    if (this.basePath) {
      return `${this.basePath}${this.path}`;
    }
    return this.path.toString();
  }
}
