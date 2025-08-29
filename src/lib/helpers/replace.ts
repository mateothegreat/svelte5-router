/**
 * Navigate to a new path by replacing the current browser history entry
 * instead of adding a new one (history.replaceState).
 *
 * @param path - The path to navigate to (excluding the base URL).
 * @param queryParams - Optional query parameters to append.
 *
 * @category Helpers
 */
export const replace = (path: string, queryParams?: Record<string, unknown>): void => {
  const url = new URL(path, window.location.origin);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value as string);
    });
  }
  window.history.replaceState({}, "", url.toString());
};
