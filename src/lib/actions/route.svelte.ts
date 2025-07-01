import { urls } from "../helpers/urls";

import { applyActiveClass } from "./apply-classes";
import type { RouteOptions } from "./options";

/**
 * Svelte action to handle routing with optional active state.
 *
 * Similar to {@link active}
 *
 * Add `use:route` to an anchor element to handle routing and optionally manage active state.
 *
 * @param {HTMLAnchorElement} node The anchor element to handle.
 * @param {RouteOptions} options Options for the route action (optional).
 * @category Actions
 * @includeExample ../demo/src/app.svelte
 * @source
 */
export const route = (node: HTMLAnchorElement, options: RouteOptions = {}) => {
  let url = urls.parse(node.href);

  const apply = () => {
    applyActiveClass(url, options, node);
  };

  /**
   * Handle click events on the anchor element.
   * @param event - The click event.
   */
  const handleClick = (event: Event) => {
    event.preventDefault();
    window.history.pushState({}, "", node.href);
    applyActiveClass(url, options, node);
  };

  apply();

  node.addEventListener("click", handleClick);
  window.addEventListener("pushState", apply);
  return {
    destroy() {
      node.removeEventListener("click", handleClick);
      window.removeEventListener("pushState", apply);
    }
  };
};
