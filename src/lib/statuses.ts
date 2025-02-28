import type { Component } from "svelte";

import type { BadRouted } from "./routed";
/**
 * The statuses that a route can have.
 *
 * @category helpers
 */
export enum StatusesMapping {
  OK = 200,
  NotFound = 404,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
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
  [K in StatusesMapping]:
    | ((path: BadRouted) => void | Promise<void> | { component: Component<any>; props?: Record<string, any> })
    | Component<any>;
}>;

/**
 * Get the status by value.
 *
 * @param {number} value The value to get the status for.
 * @returns {StatusesMapping} The status.
 *
 * @category helpers
 */
export const getStatusByValue = (value: number) => {
  return Object.keys(StatusesMapping)[Object.values(StatusesMapping).indexOf(value)];
};
