import { type Instance } from "./instance.svelte";
import { log } from "./logger";
import { type Route } from "./route.svelte";
import type Router from "./router.svelte";

import { RegistryInstance } from "./registry/registry-instance";

export type RegistryMatch = {
  registry: RegistryInstance;
  router: Router;
  instance: Instance;
  route: Route;
}

/**
 * Handles the dynamic registration and unregistration of router instances.
 *
 * @remarks
 * This is a singleton and should not be instantiated directly.
 */
export class Registry {
  /**
   * The original pushState method.
   */
  private pushState = window.history.pushState;

  /**
   * The original replaceState method.
   */
  private replaceState = window.history.replaceState;

  /**
   * The instances of the router.
   */
  instances = new Map<string, RegistryInstance>();
  parentChildMap = new Map<string, Set<string>>();
  private processingPaths = new Set<string>();
  private processingDepth = 0;
  private MAX_DEPTH = 3;

  /**
   * Register a new router instance.
   *
   * @param {Instance} instance The instance to register.
   * @see {@link unregister}: The opposite of this method.
   * @returns The handlers for the router instance.
   */
  register(instance: Instance): RegistryInstance {
    // Prevent duplicate registration
    if (this.instances.has(instance.id)) {
      return;
    }

    const registry = new RegistryInstance(instance);
    this.instances.set(instance.id, registry);

    /**
     * This allows us to log when we're in debug mode otherwise
     * this statement is removed by the compiler (tree-shaking):
     */
    if (import.meta.env.SPA_ROUTER?.logLevel === "debug") {
      log.debug(instance.id, "registered router instance", {
        count: this.instances.size
      });
    }

    return registry;
  }

  navigate(path: string): void {
    const route = this.get(path);
    if (route) {
      route.instance.applyFn(route);
    } else {
      // console.log("navigate() -----> no route found for path", path);
      // const noRoute = this.getEqualMatch(path);
      // if (noRoute) {
      //   noRoute.instance.applyFn(noRoute.route);
      // }
    }
  }

  /**
   * Retrieve a route for a given path.
   *
   * This will traverse all registered router instances and return the first match.
   *
   * @todo This is potentially a hack to wait for the routers to be registered.
   *       We should find a better way to handle this.
   *
   * @param {string} path The path to get the route for.
   *
   * @returns {Route | undefined} The route for the given path.
   */
  get(path: string): RegistryMatch | undefined {
    // Prevent deep recursion and duplicate path processing
    if (this.processingPaths.has(path) || this.processingDepth >= this.MAX_DEPTH) {
      throw new Error(`Preventing recursive routing for path: ${path}`);
    }

    console.warn("get() -----> path", path);

    try {
      this.processingPaths.add(path);
      this.processingDepth++;

      for (const [id, registry] of this.instances) {
        // Skip if this instance is already processing a route
        // if (registry.processing) continue;

        // registry.processing = true;
        try {
          const route = this.findBestMatch(registry, path);
          console.warn("get() -----> route", path, route);
          if (route) {
            return {
              registry,
              router: registry.router,
              instance: registry.instance,
              ...route
            };
          }
        } finally {
          // registry.processing = false;
        }
      }

      return undefined;
    } finally {
      this.processingPaths.delete(path);
      this.processingDepth--;
    }
  }

  // private findMatch(instance: RegistryInstance, path: string): RegistryMatch | undefined {
  //   console.warn("findMatch() -----> instance", instance.instance.id, instance);
  //   for (let route of instance.routes) {
  //     if (path === "/") {
  //       if (!route.path) {
  //         return {
  //           router: instance.router,
  //           instance: instance.instance,
  //           route,
  //           depth: 0
  //         };
  //       }
  //     } else {
  //       let matches = 0;
  //       const segments = segment(path);
  //       const tomatch = new Array(segments.length);
  //       for (let i = 0; i < segments.length; i++) {
  //         const normalized = normalize(segments[i]);
  //         console.log("testing:", route.path, normalized, test(normalize(route.path), normalized));

  //         if (test(normalize(route.path), normalized)) {
  //           matches++;
  //           tomatch[i] = segments[i];
  //           console.log("234findmatch() -----> returning route", {
  //             router: instance.router,
  //             instance: instance.instance,
  //             ...route,
  //             depth: matches
  //           }, instance.instance.id, matches, segments.length, tomatch, route);
  //           return {
  //             router: instance.router,
  //             instance: instance.instance,
  //             route,
  //             depth: matches
  //           };
  //         }

  //         // if (test(normalize(route.path), normalized)) {
  //         //   matches++;
  //         //   tomatch[i] = segments[i];
  //         // }
  //       }
  //       if (matches === (tomatch.length)) {
  //         console.log("findmatch() -----> returning route", instance.instance.id, matches, segments.length, tomatch, route);
  //         // return {
  //         //   router: instance.router,
  //         //   instance: instance.instance,
  //         //   route,
  //         //   depth: matches
  //         // };
  //       }
  //     }
  //   }

  //   throw new Error("No route found for path: " + path);
  // }

  getByBasePath(path: string): RegistryMatch {
    for (const [id, registry] of this.instances) {
      if (registry.instance.config.basePath === path) {
        return {
          registry,
          router: registry.router,
          instance: registry.instance,
          route: registry.routes.values().next().value
        };
      }
    }
  }

  getDefaultRoute(path: string): RegistryMatch {
    for (const [id, registry] of this.instances) {
      if (registry.instance.config.basePath === path) {
        for (const route of registry.routes) {
          if (!route.path) {
            return {
              registry,
              router: registry.router,
              instance: registry.instance,
              route
            };
          }
        }
      }
    }
  }

  /**
   * This method finds the best match for a given path by traversing all registered router instances
   * and returning the first match.
   *
   * It first starts from the most specific route and works its down up to the least specific route.
   *
   * @param {RegistryInstance} registry The instance to find the match for.
   * @param {string} path The path to find the match for.
   *
   * @returns {Route | undefined} The route for the given path.
   */
  private findBestMatch(registry: RegistryInstance, path: string): RegistryMatch | undefined {
    // Guard against invalid inputs
    // if (!registry || !path) return undefined;

    // Normalize the path and split into segments
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const segments = normalizedPath.split('/').filter(Boolean);

    // Track matched paths to prevent loops
    const matchStack = new Set<string>();

    const findMatch = (
      currentInstance: RegistryInstance,
      remainingSegments: string[],
      depth: number = 0,
      basePath: string = ''
    ): RegistryMatch | undefined => {
      // Guard against deep recursion
      if (depth > 10) {
        console.warn('Maximum route nesting depth exceeded');
        return undefined;
      }

      // Build current path to check
      const currentPath = `/${remainingSegments.join('/')}`;
      const fullPath = basePath + currentPath;

      // Prevent processing same path twice
      if (matchStack.has(fullPath)) return undefined;
      matchStack.add(fullPath);

      try {
        // Check if current instance can handle this path
        for (const route of currentInstance.routes) {
          const match = route.test(currentPath, basePath);
          if (match) {
            // Found a match at this level
            return {
              registry: currentInstance,
              router: currentInstance.router,
              instance: currentInstance.instance,
              route: {
                ...route,
                params: match.params,
                path: match.path
              }
            };
          }
        }

        // If no exact match found, look for default route
        const defaultRoute = this.getDefaultRoute(currentPath);
        console.warn("findMatch() -----> defaultRoute", currentInstance.instance.id, defaultRoute);
        if (defaultRoute) {
          return {
            registry: currentInstance,
            router: currentInstance.router,
            instance: currentInstance.instance,
            route: {
              ...defaultRoute,
              params: {},
              path: currentPath
            }
          };
        }

        // If no match found, look for child routers that might handle remaining segments
        for (const [id, childInstance] of this.instances) {
          if (childInstance === currentInstance) continue;
          console.warn("findMatch() -----> childInstance", childInstance.instance.id, childInstance.instance.responsible, basePath + currentPath);

          // Check if this is a child router for current path
          if (childInstance.instance.responsible?.startsWith(basePath + currentPath)) {
            console.warn("recursing-----> childInstance", childInstance.instance.id, childInstance.instance.responsible, basePath + currentPath);
            const childMatch = findMatch(
              childInstance,
              remainingSegments.slice(1),
              depth + 1,
              basePath + currentPath
            );
            if (childMatch) return childMatch;
          }
        }

        // return findNoPathPresent(currentInstance);
      } finally {
        matchStack.delete(fullPath);
      }
    };

    return findMatch(registry, segments);
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
