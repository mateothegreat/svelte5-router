export { active } from "./actions/active.svelte";
export { route } from "./actions/route.svelte";
export { goto, query } from "./methods";
export { default as Router } from "./router.svelte";
export { Instance, QueryString };
import { Instance } from "./instance.svelte";
import { QueryString } from "./query.svelte";
export { random } from "./actions/route.svelte";
export type { RouteOptions } from "./actions/route.svelte";
export type { PostHooks, PreHooks } from "./hooks";
export type { Params } from "./params";
export { normalizePath, pathContains } from "./paths";
export { registry, type Registry, type RouterHandlers } from "./registry.svelte";
export type { Route } from "./route.svelte";

