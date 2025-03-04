import { StatusCode } from "@mateothegreat/svelte5-router";

import NotFound from "$routes/not-found.svelte";

/**
 * Surface a reusable configuration for routers to import
 * and apply to their router instances:
 *
 * @example
 * ```ts
 * <script lang="ts">
 *   import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
 *   import { myDefaultRouterConfig } from "$lib/default-route-config";
 *
 *   const routes: Route[] = [
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
    [StatusCode.NotFound]: (path: string) => ({
      component: NotFound,
      props: {
        path,
        somethingExtra: new Date().toISOString()
      }
    })
  }
};
