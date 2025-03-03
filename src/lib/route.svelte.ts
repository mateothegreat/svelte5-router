import type { Component, Snippet } from "svelte";

import type { Hooks } from "./hooks";
import { paths, type PathType } from "./path";
import type { Query, QueryEvaluationResult, QueryType } from "./query.svelte";
import { Routed } from "./routed";

import { evaluators, type Evaluation } from "./helpers/evaluators";
import { Identities } from "./helpers/identify";
import { normalize } from "./helpers/normalize";
import { regexp } from "./helpers/regexp";
import type { Trace } from "./helpers/tracing.svelte";

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
  query?: QueryType;

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
    pre?: Hooks;
    post?: Hooks;
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
   * The params of the route.
   *
   * @optional If no value is provided, there are no params that could be extracted from the path.
   */
  params?: string[] | Record<string, string> | QueryEvaluationResult;

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
   * @param {Route} route An instance of the `Route` class.
   */
  constructor(route: Route) {
    this.name = route.name;
    this.path = typeof route.path === "string" ? normalize(route.path) : route.path;
    this.query = route.query;
    this.component = route.component;
    this.props = route.props;
    this.hooks = route.hooks;
    this.status = route.status;
    this.children = route.children?.map((child) => new Route(child));
  }

  /**
   * Parse the route against the given path.
   * @param path The path to parse against the route.
   */
  test?(path: PathType, query?: Query): Evaluation {
    const evaluation: Evaluation = {
      path: {
        condition: "no-match"
      }
    };

    // Handle string paths being passed in at the route.path level:
    if (typeof this.path === "string") {
      // Detect if this path contains regex syntax:
      if (regexp.can(this.path)) {
        // Path is a regex, so we need to test it against the path passed in:
        const match = regexp.from(this.path).exec(path.toString());
        if (match) {
          evaluation.path = {
            condition: "exact-match",
            params: match.groups
          };
        }
      } else {
        // Path is not a regex, so we then check if the path passed in is a direct match:
        if (normalize(this.path) === path) {
          evaluation.path = {
            condition: "exact-match"
          };
        } else if (paths.base(this.path, path.toString())) {
          evaluation.path = {
            condition: "base-match"
          };
        }
      }
    }
    // Handle RegExp instances being passed in at the route.path level:
    else if (this.path instanceof RegExp) {
      const res = evaluators[Identities.regexp](this.path, path);
      if (res) {
        evaluation.path = {
          condition: "exact-match"
        };
      }
    }
    // Handle numeric paths being passed in at the route.path level:
    else if (typeof this.path === "number" && this.path === path) {
      throw new Error("numbered route match not supported at the route.path level");
    }

    if (query) {
      const evaluation = query.test(this.query);
      if (evaluation.condition === "exact-match") {
        return new Routed(this, {
          path: "5exact-match",
          querystring: "exact-match"
        });
      } else {
        return new Routed(this, {
          path: "6exact-match",
          querystring: evaluation.condition
        });
      }
    } else {
      // return new Routed(this, {
      //   path: "no-match",
      //   querystring: "skipped-not-present"
      // });
    }
    return evaluation;
  }
}

/**
 * A route result that includes the evaluation results of the route.
 *
 * @remarks
 * This type is necessary for the internal workings of the router to ensure that
 * the evaluation results are included in the route result and to avoid requiring
 * it to be merged in the original route instance.
 */
export type RouteResult = {
  evaluation: Evaluation;
} & Route;
