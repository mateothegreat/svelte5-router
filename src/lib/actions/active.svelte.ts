

import type { RouteOptions } from "./route.svelte";

/**
 * Add the `active` class to the node if the current route matches the node's href.
 *
 * Similar to {@link active}
 *
 * Add `use:active` to an anchor element to manage active state.
 *
 * ```mermaid
 * graph TB
 *   \[route] --> Router
 *   use:active -->\[route]
 * ```
 * @param {HTMLAnchorElement} node The anchor element to handle.
 * @category actions
 * @source
 */
export const active = (node: HTMLAnchorElement, { active }: RouteOptions = {}) => {
  return;
}
