import { normalize } from "../helpers/normalize";

import type { RouteOptions } from "./options";

/**
 * Add the `active` class to the node if the current route matches the node's href.
 *
 * Similar to {@link route}
 *
 * Add `use:active` to an anchor element to manage active state.
 *
 * @param {HTMLAnchorElement} node The anchor element to handle.
 * @category actions
 * @source
 */
export const active = (node: HTMLAnchorElement, options: Pick<RouteOptions, "active"> = {}) => {
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

  applyActiveClass();

  window.addEventListener("pushState", applyActiveClass);

  return {
    destroy() {
      window.removeEventListener("pushState", applyActiveClass);
    },
  };
}
