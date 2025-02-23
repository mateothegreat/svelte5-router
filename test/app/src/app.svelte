<script lang="ts">
  import type { Instance, Route } from "@mateothegreat/svelte5-router";
  import { goto, route, Router } from "@mateothegreat/svelte5-router";
  import { logger } from "@mateothegreat/svelte5-router/logger";
  import { Github, Home } from "lucide-svelte";
  import Default from "./lib/default.svelte";
  import Delayed from "./lib/delayed.svelte";
  import Nested from "./lib/nested/nested.svelte";
  import NotFound from "./lib/not-found.svelte";
  import Params from "./lib/params/params.svelte";
  import Props from "./lib/props/props.svelte";
  import Protected from "./lib/protected/protected.svelte";
  import QueryRedirect from "./lib/query/query-redirect.svelte";

  const routes: Route[] = [
    {
      path: "",
      component: Default,
      // Use an async pre hook to simulate a protected route:
      pre: async (route: Route): Promise<Route> => {
        console.log("pre hook #1 fired for route");
        return route;
      },
      post: [
        // This is a post hook that will be executed after the route is resolved:
        (route: Route): void => {
          console.log("post hook #1 fired for route");
        },
        // This is an async post hook that will be executed after the route is resolved:
        async (route: Route): Promise<void> => {
          console.log("post hook #2 (async) fired for route");
        }
      ]
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
      path: "lazy",
      component: async () => import("./lib/lazy.svelte")
    },
    {
      path: "delayed",
      component: Delayed,
      pre: async (route: Route): Promise<Route> => {
        // Simulate a network delay by returning a promise that resolves after 1.5 seconds:
        return new Promise((resolve) =>
          setTimeout(() => {
            resolve(route);
          }, 1500)
        );
      }
    },
    {
      path: "props",
      component: Props,
      props: {
        myProp: {
          date: new Date(),
          name: "mateothegreat"
        }
      }
    },
    {
      path: "params",
      component: Params
    },
    {
      path: "logout",
      pre: async (route: Route): Promise<Route> => {
        localStorage.removeItem("token");
        return {
          path: "/",
          component: Default
        };
      }
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

  let instance = $state<Instance>();

  const globalAuthGuardHook = async (route: Route): Promise<Route> => {
    // This is a global pre hook that will be applied to all routes.
    // Here you could check if the user is logged in or perform some other
    // authentication checks.
    // NOTE: This is a pre hook, so it can return a new route to redirect to.
    //
    // If you don't want to redirect the user, just return the same route:
    return route;
  };

  const globalLoggerPostHook = async (route: Route): Promise<void> => {
    logger.debug(instance.id, "globalLoggerPostHook: path =", route.path);
  };
</script>

<div class="absolute flex h-full w-full flex-col items-center gap-4 bg-black">
  <div class="flex w-full items-center justify-between p-6">
    <div class="flex items-center gap-5">
      <h1 class="text-center font-mono text-lg text-indigo-500">Svelte SPA Router Demo</h1>
      <p class="text-center text-sm text-slate-500">
        `instance.navigating` state:
        {#if instance && instance.navigating}
          <span class="rounded border border-zinc-800 px-1 py-0.5 text-pink-500"> (true) navigating... </span>
        {:else}
          <span class="rounded border border-zinc-800 px-1 py-0.5 text-green-500"> false (idle) </span>
        {/if}
      </p>
    </div>
    <div class="flex items-center gap-2">
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
        <Home />
      </a>
    </div>
  </div>

  <span class="flex items-center text-xs text-zinc-500">Demo links to navigate to:</span>
  <div class="flex gap-3 bg-zinc-900 text-xs text-white">
    <a use:route href="/" class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">/</a>
    <a use:route href="/nested" class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">/nested</a>
    <a use:route href="/async" class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">/async</a>
    <a use:route href="/lazy" class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">/lazy</a>
    <a use:route href="/props" class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">/props</a>
    <a use:route href="/params" class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">/params</a>
    <a use:route href="/delayed" class="rounded bg-blue-600 px-3 py-1 hover:bg-blue-800">/delayed</a>
    <a use:route href="/protected" class="py-1hover:bg-pink-800 rounded bg-pink-600 px-3 py-1">/protected</a>
    <button onclick={() => goto("/a")} class="py-1hover:bg-blue-800 rounded bg-blue-600 px-3 py-1">
      Call the <span class="rounded bg-black px-2 py-0.5 text-green-500">goto("/a");</span> method
    </button>
    <a use:route href="/query-redirect" class="py-1hover:bg-pink-800 rounded bg-blue-600 px-3 py-1">/query-redirect</a>
    <a use:route href="/not-found" class="py-1hover:bg-pink-800 rounded bg-slate-600 px-3 py-1">/not-found</a>
  </div>
  <div class=" w-full flex-1 bg-zinc-900 p-6">
    <div class="flex flex-col gap-4 rounded-sm bg-zinc-950 p-4 shadow-xl">
      <p class="text-center text-xs text-zinc-500">app.svelte</p>
      <Router
        bind:instance
        {routes}
        pre={globalAuthGuardHook}
        post={globalLoggerPostHook}
        notFoundComponent={NotFound} />
    </div>
  </div>
</div>
