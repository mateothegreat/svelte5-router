import { StatusCode, type RouteResult } from "@mateothegreat/svelte5-router";

import NotFound from "$routes/not-found.svelte";

/**
 * Surface a reusable configuration for routers to import
 * and apply to their router instances:
 *
 * @example
 * ```ts
 * <script lang="ts">
 *   import { RouteConfig } from "@mateothegreat/svelte5-router";
 *   import { myDefaultRouterConfig } from "$lib/default-route-config";
 *
 *   const routes: RouteConfig[] = [
 *     {
 *       path: "/home",
 *       component: Home
 *     }
 *   ];
 * </script>
 *
 * <Router
 *   id="my-main-router"
 *   {routes}
 *   {...myDefaultRouterConfig} />
 * ```
 */
export const myDefaultRouterConfig = {
  statuses: {
    /**
     * You can use a function to return a new route or a promise that
     * resolves to a new route:
     */
    [StatusCode.NotFound]: (result: RouteResult) => {
      console.log(result);
      return {
        component: NotFound,
        props: {
          somethingExtra: new Date().toISOString()
        }
      };
    }
    /**
     * You can also use an object to return a new route while having access
     * to the path and querystring:
     *
     * [StatusCode.NotFound]: (path: RouteResult) => ({
     *   component: NotFound,
     *   props: {
     *     somethingExtra: new Date().toISOString()
     *   }
     * }),
     *
     *
     * or simply return an object with a component and props:
     *
     * [StatusCode.NotFound]: {
     *   component: NotFound,
     *   props: {
     *     somethingExtra: new Date().toISOString()
     *   }
     * }
     */
  }
};
