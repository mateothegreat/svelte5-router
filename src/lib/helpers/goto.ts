/**
 * Navigate to a new path by using the browser's history API (pushState specifically).
 *
 * @param path - The path to navigate to (excluding the base URL).
 * @param queryParams - The query parameters to add to the URL.
 *
 * @category helpers
 */
export const goto = (path: string, queryParams?: Record<string, string>): void => {
  const url = new URL(path, window.location.origin);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  window.history.pushState({}, "", url.toString());
};
