<script lang="ts">
  import type { Route, RouterInstance } from "@mateothegreat/svelte5-router";
  import { active, goto, route, Router } from "@mateothegreat/svelte5-router";
  import { registry } from "@mateothegreat/svelte5-router/registry.svelte";
  import { Github, Home as HomeIcon } from "lucide-svelte";
  import { myDefaultRouteConfig } from "./lib/common-stuff";
  import Delayed from "./lib/delayed.svelte";
  import Home from "./lib/home.svelte";
  import Nested from "./lib/nested/nested.svelte";
  import NotFound from "./lib/not-found.svelte";
  import Props from "./lib/props/props.svelte";
  import Protected from "./lib/protected/protected.svelte";
  import QueryRedirect from "./lib/query/query-redirect.svelte";

  const routes: Route[] = [
    // Example of a route that redirects to the home route:
    {
      path: "",
      hooks: {
        pre: () => {
          goto("/home");
        }
      }
    },
    {
      // Notice how no `path` is provided.
      // This means that this route will be the default route.
      path: /(?:^$|home)/,
      component: Home,
      // Use an async pre hook to simulate a protected route:
      hooks: {
        pre: async (route: Route): Promise<boolean> => {
          console.log("pre hook #1 fired for route");
          return true;
        },
        post: [
          // This is a post hook that will be executed after the route is resolved:
          (route: Route): boolean => {
            console.log("post hook #1 fired for route");
            return true;
          },
          // This is an async post hook that will be executed after the route is resolved:
          async (route: Route): Promise<boolean> => {
            console.log("post hook #2 (async) fired for route");
            return true;
          }
        ]
      }
    },
    {
      path: "nested",
      component: Nested
    },
    {
      path: "async",
      component: async () => import("./lib/async/async.svelte")
    },
    {
      path: "delayed",
      component: Delayed,
      hooks: {
        pre: async (route: Route): Promise<boolean> => {
          // Simulate a network delay by returning a promise that resolves after 1.5 seconds:
          return new Promise((resolve) =>
            setTimeout(() => {
              resolve(true);
            }, 1000)
          );
        }
      }
    },
    {
      path: "props",
      component: Props
    },
    {
      path: "protected",
      component: Protected
    },
    {
      path: "query-redirect",
      component: QueryRedirect
    }
  ];

  let instance = $state<RouterInstance>();

  const globalAuthGuardHook = async (route: Route): Promise<boolean> => {
    // This is a global pre hook that will be applied to all routes.
    // Here you could check if the user is logged in or perform some other
    // authentication checks.
    console.warn("globalAuthGuardHook");

    // Return true so that the route can continue down its evaluation path.
    return true;
  };
</script>

<div class="absolute flex h-full w-full flex-col items-center gap-4 bg-black">
  <div class="flex w-full items-center justify-between p-6">
    <div class="flex w-full justify-between">
      <h1 class="text-center font-mono text-lg text-indigo-500">Svelte SPA Router Demo</h1>
      <div class="flex gap-2">
        <a
          href="https://github.com/mateothegreat/svelte5-router"
          class="text-slate-500 hover:text-green-500"
          target="_blank">
          <Github />
        </a>
        <a
          href="https://github.com/mateothegreat/svelte5-router"
          class="text-indigo-500 hover:text-green-500"
          target="_blank">
          <HomeIcon />
        </a>
      </div>
      <table class="divide-y divide-gray-800 overflow-hidden rounded-md bg-gray-900 text-xs text-gray-400">
        <thead>
          <tr>
            <th class="px-3 py-2 text-left font-medium tracking-wider text-gray-600">Router Name</th>
            <th class="px-3 py-2 text-left font-medium tracking-wider text-gray-600">Routes</th>
            <th class="px-3 py-2 text-left font-medium tracking-wider text-gray-600">Active</th>
            <th class="px-3 py-2 text-left font-medium tracking-wider text-gray-600">Current Path</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800 font-mono">
          {#each registry.instances.entries() as [key, instance]}
            <tr>
              <td class="w-50 px-3 py-2 text-indigo-400">
                {key}
              </td>
              <td class="px-3 py-2 text-pink-500">
                {instance.routes.size}
              </td>
              <td class="px-3 py-2">
                {#if instance.navigating}
                  <span class="text-green-500">yes</span>
                {:else}
                  <span class="text-gray-500">no</span>
                {/if}
              </td>
              <td class="w-40 px-3 py-2">
                {instance.current?.path || "<default>"}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  <div class="flex w-full flex-wrap gap-3 bg-zinc-900 p-3 text-xs text-white">
    <span class="flex items-center text-xs text-zinc-500">Demos:</span>
    <a
      use:route
      use:active={{ active: { class: "bg-pink-500" } }}
      href="/"
      class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">
      /
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/props"
      class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">
      /props
    </a>
    <a
      use:route
      use:active={{ active: { class: "bg-red-500" } }}
      href="/nested"
      class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">
      /nested
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/async"
      class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">
      /async
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/delayed"
      class="rounded bg-blue-600 px-3 py-1 hover:bg-blue-800">
      /delayed
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/protected"
      class="py-1hover:bg-pink-800 rounded bg-pink-600 px-3 py-1">
      /protected
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/query-redirect"
      class="py-1hover:bg-pink-800 rounded bg-blue-600 px-3 py-1">
      /query-redirect
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/doesnt-exist"
      class="py-1hover:bg-pink-800 rounded bg-slate-600 px-3 py-1">
      /doesnt-exist
    </a>
  </div>
  <div class=" w-full flex-1 bg-zinc-900 p-6">
    <div class="flex flex-col gap-4 rounded-sm bg-zinc-950 p-4 shadow-xl">
      <p class="text-center text-xs text-zinc-500">app.svelte</p>
      <Router
        id="my-main-router"
        bind:instance
        {routes}
        basePath="/"
        hooks={{
          pre: globalAuthGuardHook
        }}
        statuses={{
          404: NotFound
        }} />
    </div>
  </div>
</div>
