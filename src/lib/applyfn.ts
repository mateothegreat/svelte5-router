import type { Route } from "./route.svelte";

/**
 * The function that is used to apply a route to the DOM.
 *
 * @category router
 */
export type ApplyFn = (route: Route) => void;
