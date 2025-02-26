import { normalize } from "../helpers/normalize";

import type { RouteOptions } from "./options";

/**
 * Svelte action to handle routing with optional active state.
 *
 * Similar to {@link active}
 *
 * Add `use:route` to an anchor element to handle routing and optionally manage active state.
 *
 * ```mermaid
 * graph TB
 *   mermaid.js --> TypeDoc;
 * ```
 * @param {HTMLAnchorElement} node The anchor element to handle.
 * @param {RouteOptions} options Options for the route action (optional).
 * @category actions
 * @includeExample test/app/src/app.svelte:185-190
 * @source
 */
export const route = (node: HTMLAnchorElement, options: RouteOptions = {}) => {
  const applyActiveClass = () => {
    const path = normalize(new URL(node.href).pathname);
    if (path === location.pathname || location.pathname.startsWith(path)) {
      if (Array.isArray(options.active?.class)) {
        node.classList.add(...options.active?.class);
      } else {
        node.classList.add(options.active?.class);
      }
    } else {
      if (Array.isArray(options.active?.class)) {
        node.classList.remove(...options.active?.class);
      } else {
        node.classList.remove(options.active?.class);
      }
    }
  };

  /**
   * Handle click events on the anchor element.
   * @param event - The click event.
   */
  const handleClick = (event: Event) => {
    event.preventDefault();
    window.history.pushState({}, "", node.href);
  };

  applyActiveClass();

  node.addEventListener("click", handleClick);
  window.addEventListener("pushState", applyActiveClass);
  return {
    destroy() {
      node.removeEventListener("click", handleClick);
      window.removeEventListener("pushState", applyActiveClass);
    },
  };
}
