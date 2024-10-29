import type { Component, Snippet } from 'svelte';

export interface Route {
  path: RegExp | string;
  component: Component<any> | Snippet;
  props?: Record<string, any>;
  pre?: () => Route;
  post?: () => void;
  children?: Route[];
  params?: string[];
}

export interface ParentRoute {
  path: string;
}

export class Instance {
  base: string;
  routes: Route[] = [];
  current = $state<Route>();

  constructor(base: string, routes: Route[], parent?: ParentRoute) {
    console.log("Instance constructor", base, routes, parent);
    this.base = base;
    this.routes = routes;
    this.current = get(this, this.base, this.routes, location.pathname, parent);

    window.addEventListener("pushState", (event: Event) => {
      const customEvent = event as CustomEvent;
      const route = get(this, this.base, this.routes, location.pathname);
      this.current = route;
    });
  }
}

export const get = (
  routerInstance: Instance,
  base: string,
  routes: Route[],
  path: string,
  parent?: ParentRoute,
): Route => {
  let route: Route;

  // If the path is the root path, return the root route:
  if (path === "/") {
    route = routes.find((route) => route.path === "/");
  }

  // Remove the base from the path before continuing:
  path = path.replace(base, "");

  // Split the path into the first segment and the rest:
  const [first, ...rest] = path.replace(/^\//, "").split("/");
  route = routes.find((route) => route.path === first);

  // If the route is not found, try to find a route that matches the path:
  if (!route) {
    for (const r of routes) {
      const regexp = new RegExp(r.path);
      const match = regexp.exec(path);
      if (match) {
        route = { ...r, params: match.slice(1) };
        break;
      }
    }
  }

  if (route?.pre) {
    const newRoute = route.pre();
    if (newRoute) {
      return newRoute;
    }
  } else {
    return route;
  }

  if (route?.post) {
    route.post();
  }
};

export const setupHistoryWatcher = (base: string, routerInstance: Instance) => {
  console.log("setupHistoryWatcher", base, routerInstance);
  const { pushState } = window.history;

  if (!(window.history as any)._listenersAdded) {
    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      window.dispatchEvent(new CustomEvent("pushState", { detail: { base } }));
    };

    window.addEventListener("pushState", (event: Event) => {
      const route = get(routerInstance, base, routerInstance.routes, location.pathname);
      if (route) {
        routerInstance.current = route;
      }
    });

    (window.history as any)._listenersAdded = true;
  }
};
