export { route, routeLinks } from "./actions/route";
export type { Route } from "./instance.svelte";
export { goto, query } from "./methods";
export * from "./router.svelte";
export { Instance as default, QueryString, Router };
import { Instance } from "./instance.svelte";
import { QueryString } from "./query.svelte";
import Router from "./router.svelte";

