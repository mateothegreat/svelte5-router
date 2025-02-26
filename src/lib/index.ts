export { active } from "./actions/active.svelte";
export { route, type RouteOptions } from "./actions/route.svelte";
export type { Hooks, PostHooks, PreHooks } from "./hooks";
export { log as logger } from "./logger";
export { goto, query } from "./methods";
export type { Params } from "./params";
export { normalizePath, pathContains } from "./paths";
export { QueryString } from "./query.svelte";
export { registry, type Registry } from "./registry.svelte";
export type { ApplyFn } from "./registry/types";
export type { Route, Routeable } from "./route.svelte";
export { RouterInstanceConfig } from "./router-instance-config";
export { RouterInstance } from "./router-instance.svelte";
export { default as Router } from "./router.svelte";

