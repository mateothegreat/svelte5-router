import type { Route } from "./route.svelte";
import type { StatusesMapping } from "./statuses";

/**
 * The result of a route being matched.
 *
 * @example
 * ```ts
 * {
 *   name: "props-page-boop",
 *   params: {
 *     child: "bar"
 *   },
 *   query: {
 *     someQueryParam: "123"
 *   },
 *   path: {
 *     before: "/\\/(?<child>.*)/",
 *     after: "/props/bar"
 *   }
 * }
 * ```
 *
 * @category router
 */
export class Routed {
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
  path: { before: RegExp | string | number; after: string };

  /**
   * The params of the route.
   *
   * @optional If no value is provided, there are no params that could be extracted from the path.
   */
  params?: string[] | Record<string, string>;

  /**
   * The props to pass to the component.
   *
   * @optional If a value is provided, the component will receive this value in $props().
   */
  props?: Record<string, any>;

  /**
   * The query params of the route.
   *
   * @optional If no value is provided, there are no query params.
   */
  query?: Record<string, string>;

  /**
   * The status of the route.
   *
   * @optional If no value is provided, the route will not have a status.
   */
  status: StatusesMapping;

  constructor(route: Route) {
    this.name = route.name;
    this.path = { before: route.path, after: "" };
    this.params = route.params;
    this.query = route.query;
  }
}

export type BadRouted = {
  path: { before: string };
  status: StatusesMapping;
};
