import type { Component } from "svelte";

import type { Span } from "./helpers/tracing.svelte";
import type { Routed } from "./routed";

/**
 * The function that is used to apply a route to the DOM.
 *
 * @category router
 */
export type ApplyFn = (component: Component, route: Routed, span?: Span) => void;
