import { urls, type URL } from "../helpers/urls";

import { RouteOptions } from "./options";

export const applyActiveClass = (href: URL, options: RouteOptions, node: HTMLAnchorElement) => {
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
    if (Array.isArray(options.active?.class)) {
      node.classList.add(...options.active?.class);
    } else {
      node.classList.add(options.active?.class);
    }
    if (options.default?.class) {
      node.classList.remove(...options.default?.class);
    }
  } else {
    if (Array.isArray(options.active?.class)) {
      node.classList.remove(...options.active?.class);
      if (options.default?.class) {
        node.classList.add(...options.default?.class);
      }
    } else {
      if (options.active?.class) {
        node.classList.remove(options.active?.class);
      }
      if (options.default?.class) {
        node.classList.add(...options.default?.class);
      }
    }
  }
};
