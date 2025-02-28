import type { Component } from "svelte";

import type { Routed } from "./route.svelte";

/**
 * The function that is used to apply a route to the DOM.
 *
 * @category router
 */
export type ApplyFn = (component: Component, route: Routed) => void;
