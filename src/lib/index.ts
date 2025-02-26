export { active } from "./actions/active.svelte";
export { route, type RouteOptions } from "./actions/route.svelte";
export type { PostHooks, PreHooks } from "./hooks";
export { Instance, type InstanceConfig } from "./instance.svelte";
export { log as logger } from "./logger";
export { goto, query } from "./methods";
export type { Params } from "./params";
export { normalizePath, pathContains } from "./paths";
export { QueryString } from "./query.svelte";
export { registry, type Registry, type RouterHandlers } from "./registry.svelte";
export type { Route, Routeable } from "./route.svelte";
export { default as Router } from "./router.svelte";

