/**
 * Normalize a path to ensure it starts with a slash.
 *
 * @param {string} path The path to normalize.
 * @returns {string} The normalized path.
 */
export const normalize = (path: string) => {
  if (path && !path.startsWith("/")) {
    path = "/" + path;
  }
  return path;
}
