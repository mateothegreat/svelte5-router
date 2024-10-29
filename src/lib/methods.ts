export const goto = (path: string) => {
  window.history.pushState({}, "", path);
};
