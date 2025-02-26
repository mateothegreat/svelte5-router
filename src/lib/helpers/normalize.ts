/**
 * Normalize a path to ensure it starts with a slash.
 *
 * @param {string} path The path to normalize.
 *
 * @returns {string} The normalized path.
 *
 * @category helpers
 */
export const normalize = (path: string): string => {
  if (path && !path.startsWith("/")) {
    path = "/" + path;
  }
  return path;
}
