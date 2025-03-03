import type { Component } from "svelte";

import type { Query } from "./query.svelte";
import type { Route } from "./route.svelte";

/**
 * The available status codes that a route can have called out from the statuses
 * handler mapping.
 *
 * @see {@link Statuses}
 * @category router
 */
export enum StatusCode {
  OK = 200,
  PermanentRedirect = 301,
  TemporaryRedirect = 302,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500
}

/**
 * Route status handler mapping.
 *
 * Status handlers are called with a path and should return a new route
 * or a promise that resolves to a new route.
 *
 * @example
 * ```ts
 * const statuses: Statuses = {
 *   [StatusCode.NotFound]: {
 *     component: NotFound,
 *     props: {
 *       importantInfo: "lets go!"
 *     }
 *   },
 *   [StatusCode.BadRequest]: (path) => {
 *     notifySomething(path);
 *     return {
 *       component: BadRequest,
 *       props: {
 *         importantInfo: "something went wrong..."
 *       }
 *     };
 *   }
 * }
 * ```
 *
 * @see {@link Route}
 * @see {@link StatusCode}
 * @see {@link getStatusByValue}
 * @category router
 */
export type Statuses = Partial<{
  [K in StatusCode]:
    | ((
        path: string,
        query?: Query
      ) => Route | Promise<Route> | { component: Component<any>; props?: Record<string, any> })
    | Component<any>;
}>;

/**
 * Get the status by value.
 *
 * @param {number} value The value to get the status for.
 * @returns {StatusCode} The status.
 *
 * @see {@link StatusCode}
 * @category router
 */
export const getStatusByValue = (value: number) => {
  return Object.keys(StatusCode)[Object.values(StatusCode).indexOf(value)];
};
