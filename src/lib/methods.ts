export const goto = (path: string) => {
  window.history.pushState({}, "", path);
};

export const query = (key: string): string | null => {
  return new URLSearchParams(window.location.search).get(key);
};
