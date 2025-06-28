/**
 * This is the doc comment for file1.ts
 *
 * @packageDocumentation
 */
import type { Component, Snippet } from "svelte";

import type { Hook } from "./hooks";
import { paths, type PathType } from "./path";
import { Query } from "./query.svelte";

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
 * This type is necessary for the internal workings of the router to ensure that
 * the evaluation results are included in the route result and to avoid requiring
 * it to be merged in the original route instance.
 *
 * @since 2.0.0
 * @category Router
 * @example
 * ```ts
 * const routeResult = new RouteResult({
 *   router: myRouter,
 *   route: myRoute,
 *   result: {
 *     path: {
 *       condition: "exact-match",
 *       original: "/users/123",
 *       params: { id: "123" }
 *     },
 *     querystring: {
 *       condition: "exact-match",
 *       original: { filter: "active" },
 *       params: { filter: "active" }
 *     },
 *     component: UserComponent,
 *     status: 200
 *   }
 * });
 * ```
 */
export class RouteResult {
  /**
   * The route that was evaluated to render this result.
   *
   * @since 2.0.0
   * @readonly
   * @remarks This may be undefined if the route result was created without an associated route.
   * @see {@link Route}
   */
  route?: Route;

  /**
   * The comprehensive result of routing evaluation that rendered this route.
   *
   * This object contains all the information gathered during the route matching process,
   * including path evaluation, querystring parsing, component resolution, and status determination.
   *
   * @since 2.0.0
   * @readonly
   * @remarks The result object is immutable once created and represents a snapshot of the routing state.
   *
   * @example
   * ```ts
   * // Accessing route evaluation results
   * console.log(routeResult.result.path.original); // "/users/123"
   * console.log(routeResult.result.path.params?.id); // "123"
   * console.log(routeResult.result.status); // 200
   * ```
   */
  result: {
    /**
     * The path evaluation results containing the matched path information.
     *
     * This object provides detailed information about how the current URL path
     * was matched against the route's path pattern, including any extracted parameters.
     *
     * @since 2.0.0
     * @example
     * ```ts
     * // For a route with path "/users/:id" and URL "/users/123"
     * const pathResult = {
     *   condition: "exact-match",
     *   original: "/users/123",
     *   params: { id: "123" }
     * };
     * ```
     */
    path: {
      /**
       * The evaluation condition indicating how the path was matched.
       *
       * @since 2.0.0
       * @see {@link Condition} For available condition types
       * @example "exact-match" | "base-match" | "no-match"
       */
      condition: Condition;

      /**
       * The original path string that was evaluated during routing.
       *
       * This represents the actual path portion of the URL that was processed,
       * without query parameters or hash fragments.
       *
       * @since 2.0.0
       * @example "/users/123/profile"
       * @remarks This path is normalized and may differ from the raw URL path
       */
      original: string;

      /**
       * The parameters extracted from the path during evaluation.
       *
       * Contains named parameters extracted from the path pattern matching,
       * such as route parameters defined with `:paramName` syntax or regex groups.
       *
       * @since 2.0.0
       * @default undefined
       * @example
       * ```ts
       * // For route "/users/:id" matching "/users/123"
       * params: { id: "123" }
       *
       * // For regex route "^/posts/(?<slug>.+)$" matching "/posts/my-article"
       * params: { slug: "my-article" }
       * ```
       * @see {@link ReturnParam} For parameter value types
       * @remarks This is undefined when no parameters are extracted from the path
       */
      params?: ReturnParam;
    };

    /**
     * The querystring evaluation results containing parsed query parameters.
     *
     * This object provides information about how the URL's query string
     * was processed and any parameters that were extracted or matched.
     *
     * @since 2.0.0
     * @example
     * ```ts
     * // For URL "?filter=active&page=2"
     * const querystringResult = {
     *   condition: "exact-match",
     *   original: { filter: "active", page: "2" },
     *   params: { filter: "active", page: "2" }
     * };
     * ```
     */
    querystring: {
      /**
       * The evaluation condition indicating how the querystring was matched.
       *
       * @since 2.0.0
       * @see {@link Condition} For available condition types
       * @example "exact-match" | "partial-match" | "no-match"
       */
      condition: Condition;

      /**
       * The original querystring data that was evaluated during routing.
       *
       * This can be either a parsed object representation of query parameters
       * or the raw querystring, depending on how the route was configured.
       *
       * @since 2.0.0
       * @see {@link ReturnParam} For supported parameter types
       * @example
       * ```ts
       * // Parsed object format
       * original: { filter: "active", sort: "name" }
       *
       * // Raw string format
       * original: "filter=active&sort=name"
       * ```
       */
      original: ReturnParam;

      /**
       * The parameters extracted from the querystring during evaluation.
       *
       * Contains the processed query parameters after applying any route-specific
       * querystring matching rules and transformations.
       *
       * @since 2.0.0
       * @default undefined
       * @see {@link ReturnParam} For parameter value types
       * @example
       * ```ts
       * // Standard query parameters
       * params: { search: "term", page: "1" }
       *
       * // With type conversion
       * params: { page: 1, active: true }
       * ```
       * @remarks This may be undefined if no querystring processing was required
       */
      params?: ReturnParam;
    };

    /**
     * The component that was resolved and rendered when the route became active.
     *
     * This represents the actual component instance, snippet, or component factory
     * that was determined during the routing process. It can be a direct component
     * reference, a lazy-loaded component function, or a Svelte snippet.
     *
     * @since 2.0.0
     * @default undefined
     * @see {@link Component} Svelte component type
     * @see {@link Snippet} Svelte snippet type
     * @example
     * ```ts
     * // Direct component reference
     * component: UserProfile
     *
     * // Lazy-loaded component
     * component: () => import('./UserProfile.svelte')
     *
     * // Svelte snippet
     * component: mySnippet
     * ```
     * @remarks This is undefined when the route doesn't render a component directly,
     * such as when using hooks for custom rendering logic
     */
    component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;

    /**
     * The HTTP-style status code representing the result of the routing operation.
     *
     * This numeric code indicates the outcome of the route evaluation process,
     * following HTTP status code conventions for consistency and familiarity.
     * The status helps determine how the route result should be handled by
     * status handlers and middleware.
     *
     * @since 2.0.0
     * @see {@link StatusCode} For predefined status code constants
     * @see {@link Statuses} For status-specific handlers
     * @example
     * ```ts
     * status: 200  // Successful route match
     * status: 404  // Route not found
     * status: 401  // Unauthorized access
     * status: 500  // Internal routing error
     * ```
     * @remarks Common values include 200 (OK), 404 (Not Found), 401 (Unauthorized),
     * 403 (Forbidden), and 500 (Internal Server Error)
     */
    status: number;
  };

  /**
   * The constructor for the `RouteResult` class.
   *
   * @param result The result of the route evaluation.
   */
  constructor(result: RouteResult) {
    this.route = result.route;
    this.result = result.result;
  }

  /**
   * The string representation of the route including the querystring.
   */
  toString?(): string {
    let querystring = "";
    if (this.result.querystring.original && typeof this.result.querystring.original === "object") {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(this.result.querystring.original)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
      querystring = params.toString();
    } else if (this.result.querystring.original) {
      querystring = String(this.result.querystring.original);
    }

    return `${this.result.path.original}${querystring ? `?${querystring}` : ""}`;
  }
}

/**
 * The function that is used to apply a route to the DOM.
 *
 * @category Router
 */
export type ApplyFn = (result: RouteResult, span?: Span) => void;

/**
 * The function that is used to apply a route to the DOM.
 *
 * @category Router
 */
export type ApplyFn2 = (result: RouteResult, span?: Span) => void;

/**
 * A generic type that can be used to test the type of a value.
 * @category Router
 * @example
 * ```ts
 * const a: Testing<string> = "asdf";
 * const b: Testing<number> = 123;
 * ```
 */
export type Testing<T> = T;

export class RouteConfig {
  name?: string | number;
  basePath?: string;
  path?: PathType;
  querystring?: Record<string, ReturnParam>;
  component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;
  props?: Record<string, any>;
  hooks?: {
    pre?: Hook | Hook[];
    post?: Hook | Hook[];
  };
  children?: RouteConfig[];
  status?: number;

  constructor(config: RouteConfig) {
    this.name = config.name;
    this.basePath = config.basePath;
    this.path = config.path;
    this.querystring = config.querystring;
    this.component = config.component;
    this.props = config.props;
    this.hooks = config.hooks;
    this.status = config.status;
  }

  toJSON?(): any {
    return {
      name: this.name,
      basePath: this.basePath,
      path: this.path,
      props: this.props,
      component: this.component,
      querystring: this.querystring,
      hooks: this.hooks,
      children: this.children,
      status: this.status
    };
  }
}

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
 * @category Router
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
