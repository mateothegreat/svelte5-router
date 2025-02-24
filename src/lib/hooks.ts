import type { Route } from "./route.svelte";

/**
 * A pre hook that can be used to modify the route before it is navigated to.
 * @category hooks
 */
export type PreHooks = ((route: Route) => Route)[] | ((route: Route) => Promise<Route>)[] | ((route: Route) => void) | ((route: Route) => Route) | ((route: Route) => Promise<Route>);

/**
 * A post hook that can be used to modify the route after it is navigated to.
 * @category hooks
 */
export type PostHooks = ((route: Route) => void)[] | ((route: Route) => Promise<void>)[] | ((route: Route) => void) | ((route: Route) => Promise<void>);
