import { normalize } from "../helpers/normalize";

import { applyActiveClass } from "./apply-classes";
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
  const apply = () => {
    applyActiveClass(normalize(new URL(node.href).pathname), location.search, options, node);
  };

  apply();

  window.addEventListener("pushState", apply);

  return {
    destroy() {
      window.removeEventListener("pushState", apply);
    }
  };
};
