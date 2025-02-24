export { active } from "./actions/active";
export { route } from "./actions/route";
export { goto, query } from "./methods";
export { default as Router } from "./router.svelte";
export { Instance, QueryString };
import { Instance } from "./instance.svelte";
import { QueryString } from "./query.svelte";
export type { Params } from "./params";
export { normalizePath, pathContains } from "./paths";
export type { Route } from "./route.svelte";

