import { RouteOptions } from "./options";

export const applyActiveClass = (path: string, querystring: string, options: RouteOptions, node: HTMLAnchorElement) => {
  const split = node.href.split("?");
  if (
    (path === location.pathname || (!options.active?.absolute && location.pathname.startsWith(path))) &&
    ((split[1] === undefined && options.active?.querystring === undefined) ||
      ((options.active?.querystring === undefined || options.active?.querystring) &&
        querystring.split("?")[1] === split[1]))
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
