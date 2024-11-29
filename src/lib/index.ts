export { route } from "./actions/route";
export { goto, query } from "./methods";
export * from "./router.svelte";

import { Instance } from "./instance.svelte";
import { QueryString } from "./query.svelte";
import Router from "./router.svelte";

export { Instance as default, QueryString, Router };
