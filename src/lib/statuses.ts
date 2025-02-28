import type { Component } from "svelte";

import type { BadRouted } from "./routed";
/**
 * The statuses that a route can have.
 *
 * @category helpers
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
 * The type for the route statuses.
 *
 * @remarks
 * A status can be a number or a function that is called
 * when the status is matched.
 *
 * @category helpers
 */
export type Statuses = Partial<{
  [K in StatusCode]:
    | ((path: BadRouted) => void | Promise<void> | { component: Component<any>; props?: Record<string, any> })
    | Component<any>;
}>;

/**
 * Get the status by value.
 *
 * @param {number} value The value to get the status for.
 * @returns {StatusCode} The status.
 *
 * @category helpers
 */
export const getStatusByValue = (value: number) => {
  return Object.keys(StatusCode)[Object.values(StatusCode).indexOf(value)];
};
