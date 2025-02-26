import { log } from "./logger";
import type { Route } from "./route.svelte";
import { RouterInstanceConfig } from "./router-instance-config";
import { RouterInstance } from "./router-instance.svelte";
import { ReactiveMap } from "./utilities.svelte";

export type ApplyFn = (route: Route) => void;

/**
 * Handles the dynamic registration and deregistration of router instances.
 *
 * @remarks
 * This is a singleton and should not be instantiated directly.
 */
export class Registry {
  /**
   * Container for router instances.
   */
  instances = new ReactiveMap<string, RouterInstance>();

  constructor() {
    // Prevent multiple instantiation during HMR by storing instance in window
    if ((window as any).__SVELTE_SPA_ROUTER_REGISTERED__) {
      return (window as any).__SVELTE_SPA_ROUTER_REGISTERED__;
    }
    (window as any).__SVELTE_SPA_ROUTER_REGISTERED__ = this;

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
    if (this.instances.has(config.id)) {
      throw new Error(`Router instance with id ${config.id} already registered`);
    }

    const instance = new RouterInstance(config, applyFn);
    this.instances.set(config.id, instance);

    /**
     * This allows us to log when we're in debug mode otherwise
     * this statement is removed by the compiler (tree-shaking):
     */
    if (import.meta.env.SPA_ROUTER?.logLevel === "debug") {
      log.debug(config.id, "registered router instance", {
        id: config.id,
        routes: config.routes.length,
        registries: this.instances.size,
        basePath: config.basePath
      });
    }

    return instance;
  }

  /**
   * Unregister a router instance.
   *
   * @param {string} id The id of the instance to unregister.
   */
  unregister(id: string): void {
    const instance = this.instances.get(id);
    if (instance) {
      if (import.meta.env.SPA_ROUTER?.logLevel === "debug") {
        log.debug(id, "unregistered router instance", {
          id: id,
          routes: instance.config.routes.length
        });
      }
      this.instances.delete(id);
    }
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
export const registry = (window as any).__SVELTE_SPA_ROUTER_REGISTRY__ || new Registry();
