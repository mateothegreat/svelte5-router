import type { Component, Snippet } from "svelte";

import type { PostHooks, PreHooks } from "./hooks";
import type { Instance } from "./instance.svelte";
import { normalizePath } from "./paths";

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
   * @type {string | number}
   * @optional If no value is provided, the route will not have a name.
   */
  name?: string | number;

  /**
   * The path of the route to match against the current path.
   *
   * @type {RegExp | string | number}
   */
  path: RegExp | string | number;
  /**
   * The params of the route.
   *
   * @type {string[] | Record<string, string>}
   * @optional If no value is provided, there are no params that could be extracted from the path.
   */
  params?: string[] | Record<string, string>;
  /**
   * The remaining path of the route.
   *
   * @type {string}
   * @optional If no value is provided, there is no remaining path.
   */
  remaining?: string;
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
   * @type {string | number}
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
   * @type {Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any}
   * @optional If no value is provided, the route will not render a component.
   * This is useful if you want to use pre or post hooks to render a component
   * or snippet conditionally.
   */
  component?: Component<any> | Snippet | (() => Promise<Component<any> | Snippet>) | Function | any;

  /**
   * The props to pass to the component.
   *
   * @type {Record<string, any>}
   * @optional If a value is provided, the component will receive this value in $props().
   */
  props?: Record<string, any>;

  /**
   * The pre hooks to run before the route is rendered.
   *
   * @type {PreHooks}
   * @optional If no value is provided, no pre hooks will be run.
   */
  pre?: PreHooks;

  /**
   * The post hooks to run after the route is rendered.
   *
   * @type {PostHooks}
   * @optional If no value is provided, no post hooks will be run.
   */
  post?: PostHooks;

  /**
   * The children routes of the route.
   *
   * This is useful if you want to be declarative about the routes that are direct
   * children of this route and not depend on the router to determine the children
   * when there are multiple <Router/> instances.
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
   *
   * @type {Route[]} An array of routes that are direct children of this route.
   * @optional If no value is provided, there are no direct child routes.
   */
  children?: Route[];

  /**
   * The params of the route.
   *
   * @type {string[] | Record<string, string>}
   * @optional If no value is provided, there are no params that could be extracted from the path.
   */
  params?: string[] | Record<string, string>;

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
   *
   * @type {boolean}
   * @private This is used internally to track the active state of the route.
   */
  active? = $state(false);

  /**
   * The route instance.
   *
   * @type {Instance}
   * @private This is used internally to track the route instance.
   */
  #instance?: Instance;

  /**
   * The constructor for the `Route` class.
   * @param {Route} route An instance of the `Route` class.
   */
  constructor(route: Route) {
    this.name = route.name;
    this.path = route.path;
    this.component = route.component;
    this.props = route.props;
    this.pre = route.pre;
    this.post = route.post;
    this.children = route.children?.map(child => new Route(child));
  }

  /**
   * Test if the route matches the given path.
   * @param {RegExp | string | number} path The path to test against the route.
   * @param {string} basePath The base path of the route.
   * @optional If no value is provided, the route will match any path.
   * @returns {boolean} True if the route matches the given path, false otherwise.
   */
  test?(path: RegExp | string | number, basePath?: string): Routeable {
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
            params: match.groups || match.slice(1),
            remaining: segments.slice(match.length).join('/')
          };
        }
      } else {
        // Path is not a regex, so we then check if the path passed in is a direct match:
        // const routePath = this.path.toString().replace(/^\/|\/$/g, '');
        const routePath = normalizePath(this.path);
        if (routePath === pathStr) {
          return {
            path: this.path,
            params: {},
            remaining: segments.slice(1).join('/')
          };
        }
        console.log(basePath, this.path, normalizePath(this.path), normalizePath(segments[0]));
        // console.log(this.path, normalizePath(this.path), normalizePath(segments[0]));
        if (normalizePath(this.path) === normalizePath(segments[0])) {
          const remainingSegments = segments.slice(1);
          console.log("left with final effort", path, this.path, pathStr, routePath, remainingSegments);
          return {
            path: this.path,
            params: remainingSegments,
            remaining: remainingSegments.length
              ? '/' + remainingSegments.join('/')
              : '/'
          };
        }
      }

      // Handle possible regex routes:

      // // Check if this route matches the first segment(s)
      // const isMatch = routeSegments.every((segment, i) => segment === segments[i]);

      // if (isMatch) {
      //   // If we have children and there are remaining segments, check children
      //   if (this.children && segments.length > routeSegments.length) {
      //     const remainingPath = '/' + segments.slice(routeSegments.length).join('/');
      //     return this.children.some(child => child.test?.(remainingPath));
      //   }
      //   return true;
      // } else {
      //   console.log("no match", this.path, pathStr, routePath, routeSegments, segments, isMatch);
      // }
    }
    // Handle RegExp paths
    else if (this.path instanceof RegExp) {
      const match = this.path.exec(pathStr);
      if (match) {
        return {
          path: this.path.toString(),
          params: match.groups || match.slice(1),
          // remainingPath: segments.slice(routeSegments.length).join('/')
        };
      }
      // // Check children if no direct match
      // if (this.children) {
      //   return this.children.some(child => child.test?.(path));
      // }
    }
    // Handle numeric paths
    else if (typeof this.path === 'number' && this.path === path) {
      return {
        path: this.path.toString(),
        params: {},
        // remainingPath: segments.slice(routeSegments.length).join('/')
      };
    }
  }
}