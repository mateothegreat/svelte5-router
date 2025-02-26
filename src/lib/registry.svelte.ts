import { log } from "./logger";
import { RouterInstanceConfig } from "./router-instance-config";
import { RouterInstance } from "./router-instance.svelte";
import { ReactiveMap } from "./utilities.svelte";

import type { ApplyFn } from './registry/types';

/**
 * Handles the dynamic registration and unregistration of router instances.
 *
 * @remarks
 * This is a singleton and should not be instantiated directly.
 */
export class Registry {
  /**
   * The instances of the router.
   */
  instances = new ReactiveMap<string, RouterInstance>();

  count = $state<number>(0);

  constructor() {
    const { pushState, replaceState } = window.history;

    window.history.pushState = function (...args) {
      pushState.apply(window.history, args);
      window.dispatchEvent(new Event("pushState"));
    };

    window.history.replaceState = function (...args) {
      replaceState.apply(window.history, args);
      window.dispatchEvent(new Event("replaceState"));
    };
  }

  /**
   * Register a new router instance.
   *
   * @param {Instance} config The instance to register.
   * @param {ApplyFn} applyFn The function to call for applying route changes.
   *
   * @see {@link unregister}: The opposite of this method.
   */
  register(config: RouterInstanceConfig, applyFn: ApplyFn): RouterInstance {
    // Prevent duplicate registration
    if (this.instances.has(config.id)) {
      return;
    }

    const registry = new RouterInstance(config, applyFn);
    this.instances.set(config.id, registry);

    /**
     * This allows us to log when we're in debug mode otherwise
     * this statement is removed by the compiler (tree-shaking):
     */
    if (import.meta.env.SPA_ROUTER?.logLevel === "debug") {
      log.debug(config.id, "registered router instance", {
        routes: config.routes.length,
        registries: this.instances.size
      });
    }

    this.count++;

    return registry;
  }

  /**
   * Unregister a router instance.
   *
   * @param {string} id The id of the instance to unregister.
   */
  unregister(id: string): void {
    this.instances.delete(id);
    this.count--;
  }
}

/**
 * Expose a reference to the registry of router instances.
 *
 * This is used to register & unregister router instances and to get
 * the route for a given path.
 *
 * This is a singleton and should not be instantiated directly and should
 * never be accessed outside of the scope of this package in most cases.
 */
export const registry = new Registry();
