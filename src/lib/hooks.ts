import type { Route } from "./route.svelte";

/**
 * Hooks are functions that can be used to modify the behavior of routing
 * when a route is navigated to (before and/or after).
 *
 * The return value of the hook is a boolean that determines if the route should
 * be navigated to. If the hook returns `false`, navigation will be cancelled.
 *
 * @category hooks
 */
export type Hooks =
  ((route: Route) => boolean)[] |
  ((route: Route) => Promise<boolean>)[] |
  ((route: Route) => boolean) |
  ((route: Route) => Promise<boolean>);
