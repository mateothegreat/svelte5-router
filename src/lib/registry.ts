import { Registry } from "./registry.svelte";

/**
 * Expose a reference to the registry of router instances.
 *
 * This is used to register & unregister router instances and to get
 * the route for a given path.
 *
 * This is a singleton and should not be instantiated directly and should
 * never be accessed outside of the scope of this package in most cases.
 *
 * @category registry
 */
export const registry =
  (window as any).__SVELTE_SPA_ROUTER_REGISTRY__ || new Registry();
