<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { myDefaultRouterConfig } from "$lib/default-route-config";
  import { session } from "$lib/session.svelte";
  import Extras from "$routes/extras/extras.svelte";
  import Home from "$routes/home.svelte";
  import Nested from "$routes/nested/nested.svelte";
  import PathsAndParams from "$routes/paths-and-params/paths-and-params.svelte";
  import Patterns from "$routes/patterns/patterns.svelte";
  import Protected from "$routes/protected/main.svelte";
  import Transitions from "$routes/transitions/transitions.svelte";
  import type { RouteConfig, RouteResult } from "@mateothegreat/svelte5-router";
  import { goto, logging, registry, type Route, Router, type RouterInstance } from "@mateothegreat/svelte5-router";
  import { BookHeart, Github, HelpCircle, MousePointerClick } from "lucide-svelte";

  /**
   * Only needed for the demo environment development.
   *
   * It is not needed for including the router package in your project.
   */
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      import.meta.hot!.invalidate();
    });
  }

  /**
   * This is a state variable that will hold the router instance.
   *
   * It can be used to access the current route, navigate, etc:
   */
  let router: RouterInstance = $state();

  /**
   * Get notified when the current route changes:
   */
  const route = $derived(router.current);
  $effect(() => {
    if (router.current) {
      logging.info(
        `🚀 I'm an $effect in app.svelte and i'm running because the current route is now ${router.current.result.path.original}!`
      );
    }
  });

  /**
   * Let's declare our routes for the main app router:
   */
  const routes: RouteConfig[] = [
    {
      // You can name your routes anything you want for tracking or debugging:
      name: "default-route",
      hooks: {
        pre: async (route: RouteResult) => {
          console.error(`redirecting to ${session.mode === "hash" ? "/#" : ""}/home using a pre hook!`, route);
          goto(`${session.mode === "hash" ? "/#" : ""}/home`);
        },
        post: async (route: RouteResult) => {
          console.error(`post hook fired for route`, route);
        }
      }
    },
    {
      path: "/patterns",
      component: Patterns
    },
    {
      // Here we use a regex to match the home route.
      // This is useful if you want to match a route that has a dynamic path.
      // The "?:" is used to group the regex without capturing the match:
      // path: /^\/($|home)$/,
      path: "home",
      component: Home,
      // Use hooks to perform actions before and after the route is resolved:
      hooks: {
        pre: async (route: Route): Promise<boolean> => {
          // console.log("pre hook #1 fired for route");
          return true; // Return true to continue down the route evaluation path.
        },
        // Hooks can also be an array of functions (async too):
        post: [
          // This is a post hook that will be executed after the route is resolved:
          (route: Route): boolean => {
            // console.log("post hook #1 fired for route");
            return true; // Return true to continue down the route evaluation path.
          },
          // This is an async post hook that will be executed after the route is resolved:
          async (route: Route): Promise<boolean> => {
            // console.log("post hook #2 (async) fired for route");
            return true; // Return true to continue down the route evaluation path.
          }
        ]
      }
    },
    {
      path: "nested",
      component: Nested
    },
    {
      path: "paths-and-params",
      component: PathsAndParams
    },
    {
      path: "protected",
      component: Protected
    },
    {
      path: "transitions",
      component: Transitions
    },
    {
      path: "extras",
      component: Extras
    }
  ];

  // This is a global pre hook that can be applied to all routes.
  // Here you could check if the user is logged in or perform some other
  // authentication checks:
  const globalAuthGuardHook = async (route: Route): Promise<boolean> => {
    console.warn("globalAuthGuardHook", route);
    // Return true so that the route can continue down its evaluation path.
    return true;
  };
</script>

<div class="flex h-screen flex-col gap-4 bg-zinc-700/25 p-4">
  <div class="flex items-start">
    <div class="flex flex-col gap-4">
      <a
        href="https://github.com/mateothegreat/svelte5-router"
        class="text-slate-400 hover:text-green-500"
        target="_blank">
        <Github class="h-6 w-6" />
      </a>
      <a
        href="https://github.com/mateothegreat/svelte5-router"
        class="text-slate-400 hover:text-green-500"
        target="_blank">
        <BookHeart class="h-6 w-6 text-fuchsia-500" />
      </a>
    </div>
    <div class="logo h-51 w-60">
      <img
        src="https://github.com/mateothegreat/svelte5-router/raw/dev/docs/assets/logo.png"
        alt="logo" />
    </div>
    <div class="m-4 flex-1 flex justify-end text-indigo-400 gap-2 text-xs">
      <div class="text-slate-500 text-sm mb-3.5 rounded-md border-2 bg-black px-2 py-1.5">
        demo version: <a
          href="https://github.com/mateothegreat/svelte5-router/tree/{window.__SVELTE5_ROUTER_VERSION__}"
          class="text-emerald-500 hover:text-blue-400 cursor-pointer"
          target="_blank">
          {window.__SVELTE5_ROUTER_VERSION__}
        </a>
      </div>
    </div>
  </div>
  <div class="flex-1 gap-4 flex flex-col">
    <div
      class="text-slate-500 justify-end items-center text-sm flex gap-2 rounded-md border-2 border-slate-700/75 bg-black/30 px-2 py-1.5">
      <MousePointerClick class="h-4 w-4 text-slate-500" />
      change url mode:
      <button
        class="flex items-center gap-1 rounded-md border-2 border-purple-600 bg-slate-900/50 font-semibold px-3 py-0.5 cursor-pointer hover:bg-slate-800 hover:border-green-600"
        class:text-orange-400={session.mode === "hash"}
        class:text-green-400={session.mode === "path"}
        onclick={() => {
          session.mode = session.mode === "hash" ? "path" : "hash";
        }}>
        {session.mode === "hash" ? "path" : "hash"}
      </button>
    </div>
    <RouteWrapper
      name="main app router"
      title={{
        file: "src/app.svelte",
        content:
          "This is the main app component, it contains the top level router and then uses nested routers to divide and conquer your complex routing requirements! 🚀"
      }}
      {router}
      {route}
      links={[
        {
          href: "/",
          label: "/",
          options: {
            active: {
              absolute: true
            }
          }
        },
        {
          href: "/home",
          label: "/home"
        },
        {
          href: "/patterns",
          label: "/patterns"
        },
        {
          href: "/protected",
          label: "/protected"
        },
        {
          href: "/paths-and-params",
          label: "/paths-and-params"
        },
        {
          href: "/nested",
          label: "/nested"
        },
        {
          href: "/transitions",
          label: "/transitions"
        },
        {
          href: "/404",
          label: "/404"
        },
        {
          href: "/extras",
          label: "/extras"
        }
      ]}>
      <div class="flex-1">
        <Router
          id="my-main-router"
          bind:instance={router}
          {routes}
          {...myDefaultRouterConfig} />
      </div>
    </RouteWrapper>
  </div>
</div>
<div
  class="fixed bottom-0 right-10 overflow-hidden rounded-t-md border-2 border-b-0 bg-neutral-950 text-xs text-gray-400">
  <p class="flex items-center gap-1.5 bg-black/80 p-2.5 text-sm font-medium text-slate-400">
    <a
      href="https://github.com/mateothegreat/svelte5-router/blob/main/docs/registry.md"
      class="text-yellow-300/70 hover:text-pink-500"
      target="_blank">
      <HelpCircle class="h-5 w-5" />
    </a>
    router registry
  </p>
  <table class="divide-y divide-gray-900 overflow-hidden rounded-md border-2 text-xs text-gray-400">
    <thead>
      <tr class="text-center tracking-wider text-slate-500">
        <th class="px-3 py-2 font-medium">Router Name</th>
        <th class="px-3 py-2 font-medium">Routes</th>
        <th class="px-3 py-2 font-medium">State</th>
        <th class="px-3 py-2 font-medium">Current Path</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-800 font-mono">
      {#each registry.instances.entries() as [key, instance]}
        <tr>
          <td class="px-3 py-2 text-left text-indigo-400">
            {key}
          </td>
          <td class="px-3 py-2 text-pink-500">
            {instance.routes.size}
          </td>
          <td class="px-3 py-2">
            {#if instance.navigating}
              <span class="text-green-500">busy</span>
            {:else}
              <span class="text-gray-500">idle</span>
            {/if}
          </td>
          <td class="px-3 py-2 text-green-500">
            {instance.current?.path || "<default>"}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
