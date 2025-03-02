import type { Component, Snippet } from "svelte";

import type { Hooks } from "./hooks";
import { Routed } from "./routed";

import type { PathType } from "./path";
import type { Query, QueryTest, QueryType } from "./query.svelte";

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
  params?: string[] | Record<string, string> | QueryTest;

  /**
   * The status of the route once it has been matched or otherwise processed.
   */
  status?: number;

  /**
   * The constructor for the `Route` class.
   *
   * @param {Route} route An instance of the `Route` class.
   */
  constructor(route: Route) {
    this.name = route.name;
    this.path = route.path;
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
  test?(path: RegExp | string | number, query?: Query): Routed {
    const segments = path.toString().split("/").filter(Boolean);
    // Handle string paths
    if (typeof this.path === "string") {
      // Detect possible paths that use regex syntax:
      if (/[[\]{}()*+?.,\\^$|#\s]/.test(this.path)) {
        // Path is a regex, so we need to test it against the path passed in:
        const match = new RegExp(this.path).exec(segments.join("/"));
        if (match) {
          if (query) {
            if (query.test(this.query)) {
              return new Routed({
                path: this.path,
                params: match.groups || match.slice(1)
              });
            }
          } else {
            return new Routed({
              path: this.path,
              params: match.groups || match.slice(1)
            });
          }
        }
      } else {
        // Path is not a regex, so we then check if the path passed in is a direct match:
        if (this.path === path) {
          return new Routed({
            path: this.path
          });
        } else if (this.path === segments[0]) {
          return new Routed({
            path: this.path
          });
        }
      }
    }
    // Handle RegExp paths
    else if (this.path instanceof RegExp) {
      const match = this.path.exec(path.toString());
      if (match) {
        if (query) {
          if (query.test(this.query)) {
            return new Routed({
              path: this.path,
              params: match.groups || match.slice(1)
            });
          }
        } else {
          return new Routed({
            path: this.path,
            params: match.groups || match.slice(1)
          });
        }
      }
    }
    // Handle numeric paths
    else if (typeof this.path === "number" && this.path === path) {
      return new Routed({
        path: this.path
      });
    }
  }
}
