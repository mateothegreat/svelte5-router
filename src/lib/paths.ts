import type { Route } from "./route.svelte";

/**
 * Normalize a path to ensure it starts with a slash.
 * @param {string} path The path to normalize.
 * @returns {string} The normalized path.
 */
export const normalizePath = (path: string) => {
  if (typeof path === "string") {
    return path.startsWith('/') ? path : '/' + path;
  }

  return path;
}

/**
 * Determine if a path contains a route.
 * @param {string} path The path to check.
 * @param {Route} route The route to check against the path.
 * @returns {boolean} True if the path contains the route, false otherwise.
 */
export const pathContains = (path: string, route: Route) => {
  const parts = route.path.toString().split('/').filter(Boolean);
  const segments = path.split('/').filter(Boolean);

  console.log(parts, segments);

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] !== segments[i]) {
      return false;
    }
  }

  return true;
}