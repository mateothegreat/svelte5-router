import type { Component } from 'svelte';
import { writable } from 'svelte/store';

export interface Route {
  path: RegExp | string;
  component: Component;
  pre?: () => boolean;
  post?: () => boolean;
  children?: Route[];
  params?: string[];
}

export interface ParentRoute {
  path: string;
}

export class Instance {
  base: string;
  routes: Route[] = [];
  current = writable<Route>();

  constructor(base: string, routes: Route[], parent?: ParentRoute) {
    this.base = base;
    this.routes = routes;
    this.current.set(getNestedRoute(this, this.base, this.routes, location.pathname, parent));

    window.addEventListener("pushState", (event: Event) => {
      const customEvent = event as CustomEvent;
      const route = getNestedRoute(this, this.base, this.routes, location.pathname);
      this.current.set(route);
    });
  }
}

export const getNestedRoute = (
  routerInstance: Instance,
  base: string,
  routes: Route[],
  path: string,
  parent?: ParentRoute,
): Route => {
  if (path === "/") {
    return routes.find((route) => route.path === "/");
  }

  path = path.replace(base, "");

  const [first, ...rest] = path.replace(/^\//, "").split("/");
  const route = routes.find((route) => route.path === first);

  if (!route) {
    for (const route of routes) {
      const regexp = new RegExp(route.path);
      const match = regexp.exec(path);
      console.log(route.path, path, match);
      if (match) {
        console.log(path, match);
        return { ...route, params: match.slice(1) };
      }
    }
  }

  return route;
};

export const setupHistoryWatcher = (base: string, routerInstance: Instance) => {
  console.log("setupHistoryWatcher", base, routerInstance);
  const { pushState, replaceState } = window.history;

  if (!(window.history as any)._listenersAdded) {
    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      window.dispatchEvent(new CustomEvent("pushState", { detail: { base } }));
    };

    window.addEventListener("pushState", (event: Event) => {
      const customEvent = event as CustomEvent;
      const route = getNestedRoute(routerInstance, base, routerInstance.routes, location.pathname);
      console.log("pushState:", location.pathname, base, route);
      routerInstance.current.set(route);
    });

    (window.history as any)._listenersAdded = true;
  }
};
