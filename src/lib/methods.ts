export const goto = (path: string, searchParams?: Record<string, string>) => {
  const url = new URL(path, window.location.origin);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  console.log(`${window.location.origin}/${url.toString()}`);
  window.history.pushState({}, "", `${window.location.origin}/${url.toString()}`);
};

export const query = (key: string): string | null => {
  return new URLSearchParams(window.location.search).get(key);
};
