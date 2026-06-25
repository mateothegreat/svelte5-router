import { urls, type URL } from "../helpers/urls";

import { RouteOptions } from "./options";

/**
 * Applies the active class and/or `aria-current` to the node if the href is the same as the current location.
 *
 * @param href - The href to check if it is the same as the current location.
 * @param options - The options to apply to the node.
 * @param node - The node to apply the active class to.
 *
 * @category Actions
 */
export const applyActive = (href: URL, options: RouteOptions, node: HTMLAnchorElement) => {
  const url = urls.parse(location.toString());
  if (
    (href.path === url.path ||
      href.path === url.hash.path ||
      href.hash.path === url.path ||
      (!options.active?.absolute && url.path.startsWith(href.path))) &&
    (options.active?.querystring || options.active?.querystring === undefined) &&
    (href.query.original == "" ||
      href.query.original === location.search.replace("?", "") ||
      href.query.original === url.hash.query.original)
  ) {
    // Active state!

    // Remove the _default_ state classes.
    if (options.default?.class) {
      node.classList.remove(...(Array.isArray(options.default.class) ? options.default.class : [options.default.class]));
    }

    // Then apply the _active_ state classes and `aria-current`.
    if (options.active?.class) {
      node.classList.add(...(Array.isArray(options.active.class) ? options.active.class : [options.active.class]));
    }
    node.ariaCurrent = options.active.ariaCurrent;
  } else {
    // Default/not active state!

    // Remove the _active_ state classes.
    if (options.active?.class) {
      node.classList.remove(...(Array.isArray(options.active.class) ? options.active.class : [options.active.class]));
    }

    // Then apply the _default_ state classes and `aria-current`.
    if (options.default?.class) {
      node.classList.add(...(Array.isArray(options.default.class) ? options.default.class : [options.default.class]));
    }
    node.ariaCurrent = options.default.ariaCurrent;
  }
};
