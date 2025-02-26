/**
 * Navigate to a new path by using the browser's history API (pushState specifically).
 *
 * @param path - The path to navigate to (excluding the base URL).
 * @param queryParams - The query parameters to add to the URL.
 */
export const goto = (path: string, queryParams?: Record<string, string>) => {
  const url = new URL(path, window.location.origin);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  window.history.pushState({}, "", url.toString());
};

/**
 * Get a query parameter from the current URL.
 *
 * @param key - The key of the query parameter to get
 * @returns The value of the query parameter, or null if it doesn't exist
 */
export const query = (key: string): string | null => {
  return new URLSearchParams(window.location.search).get(key);
};
