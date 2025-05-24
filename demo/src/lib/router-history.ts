import type { Route } from "@mateothegreat/svelte5-router";

export const history = $state<Route[]>([]);

export const appendHistory = (route: Route) => {
  history.push(route);
};
