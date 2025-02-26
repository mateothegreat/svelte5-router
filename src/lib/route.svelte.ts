import type { Component, Snippet } from "svelte";

import type { PostHooks, PreHooks } from "./hooks";

/**
 * The result of a route being matched.
 *
 * @example
 * ```ts
 * {
 *   name: "user-home-page",
 *   path: "/users/:id",
 *   params: { id: "123" },
 *   remaining: "/posts"
 * }
 * ```
 */
export type Routeable = {
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
   */
  path: RegExp | string | number;

  /**
   * The params of the route.
   *
   * @optional If no value is provided, there are no params that could be extracted from the path.
   */
  params?: string[] | Record<string, string>;
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
   * @type {RegExp | string | number}
   * @optional If not provided, the route will match any path
   * as it will be the default route.
   */
  path?: RegExp | string | number;

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
    pre?: PreHooks;
    post?: PostHooks;
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
  params?: string[] | Record<string, string>;

  /**
   * The query params of the route.
   *
   * @optional If no value is provided, there are no query params.
   */
  query?: Record<string, string>;

  /**
   * The remaining path of the route.
   *
   * @optional If no value is provided, there is no remaining path.
   */
  remaining?: string;

  /**
   * The status of the route once it has been matched or otherwise processed.
   * Values can be:
   * - `200`: A match was found and the route is active.
   * - `404`: No route was found.
   * - `500`: An error occurred while processing the route (check the console for more details).
   *
   */
  status?: number;

  /**
   * The active state of the route.
   */
  // active? = $state(false);

  /**
   * The route instance.
   */
  // #instance?: Instance;

  /**
   * The constructor for the `Route` class.
   *
   * @param {Route} route An instance of the `Route` class.
   */
  constructor(route: Route) {
    this.name = route.name;
    this.path = route.path;
    this.component = route.component;
    this.props = route.props;
    this.hooks = route.hooks;
    this.status = route.status;
    this.children = route.children?.map(child => new Route(child));
  }

  /**
   * Parse the route against the given path.
   * @param path The path to parse against the route.
   */
  test?(path: RegExp | string | number): Routeable {
    const pathStr = path.toString();
    const segments = pathStr.split('/').filter(Boolean);
    // Handle string paths
    if (typeof this.path === 'string') {
      // Detect possible paths that use regex syntax:
      if (/[[\]{}()*+?.,\\^$|#\s]/.test(this.path)) {
        // Path is a regex, so we need to test it against the path passed in:
        const match = new RegExp(this.path).exec(segments.join('/'));
        if (match) {
          return {
            path: this.path,
            params: match.groups || match.slice(1)
          };
        }
      } else {
        // Path is not a regex, so we then check if the path passed in is a direct match:
        const routePath = this.path;
        if (routePath === pathStr) {
          return {
            path: this.path
          };
        } else if (this.path === segments[0]) {
          const remainingSegments = segments.slice(1);
          return {
            path: this.path,
            params: remainingSegments
          };
        }
      }
    }
    // Handle RegExp paths
    else if (this.path instanceof RegExp) {
      const match = this.path.exec(pathStr);
      if (match) {
        return {
          path: this.path.toString(),
          params: match.groups || match.slice(1),
        };
      }
    }
    // Handle numeric paths
    else if (typeof this.path === 'number' && this.path === path) {
      return {
        path: this.path.toString(),
      };
    }
  }
}