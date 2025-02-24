import { tick } from "svelte";

import { registry } from "../registry.svelte";

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
  const url = new URL(node.href);
  const route = registry.get(url.pathname);

  $effect(() => {
    if (route?.active) {
      node.classList.add(active?.class);
    } else {
      node.classList.remove(active?.class);
    }
  });
  /**
   * Handle click events on the anchor element.
   * @param event - The click event.
   */
  const handleClick = (event: Event) => {
    event.preventDefault();
    window.history.pushState({}, "", node.href);
    tick().then(() => {
    });
  };

  node.addEventListener("click", handleClick);

  return {
    destroy() {
      node.removeEventListener("click", handleClick);
    },
  };
}
