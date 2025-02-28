export { active } from "./actions/active.svelte";
export type { RouteOptions } from "./actions/options";
export { route } from "./actions/route.svelte";
export type { ApplyFn } from "./applyfn";
export { goto } from "./helpers/goto";
export { normalize } from "./helpers/normalize";
export { query } from "./helpers/query";
export { Query } from "./helpers/query.svelte";
export type { Hooks } from "./hooks";
export { log as logger } from "./logger";
export type { RouteParams as Params } from "./params";
export type { Route, Routed } from "./route.svelte";
export { RouterInstanceConfig } from "./router-instance-config";
export { Registry, RouterInstance };
import { Registry } from "./registry.svelte";
import * as RouterInstance from "./router-instance.svelte";

export { default as Router } from "./router.svelte";

export { registry } from "./registry";
