<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import Home from "$routes/home.svelte";
  import Nested from "$routes/nested/nested.svelte";
  import NotFound from "$routes/not-found.svelte";
  import Props from "$routes/props/props.svelte";
  import Protected from "$routes/protected/main.svelte";
  import Transitions from "$routes/transitions/transitions.svelte";
  import type { Route, RouterInstance } from "@mateothegreat/svelte5-router";
  import { type BadRouted, goto, registry, Router } from "@mateothegreat/svelte5-router";
  import { BookHeart, Github, HelpCircle } from "lucide-svelte";
  import { setContext } from "svelte";
  import { getStatusByValue } from "./../../src/lib/statuses.ts";

  // This is a state variable that will hold the router instance.
  // It can be used to access the current route, navigate, etc:
  let instance = $state<RouterInstance>();

  // This is a global context that can be accessed by all routes.
  // It can be retrieved using the `getContext("foo")` function.
  setContext("foo", { bar: "baz" });

  const routes: Route[] = [
    // Example of a route that redirects to the home route:
    {
      path: "",
      hooks: {
        pre: () => {
          goto("/home");
          return false;
        }
      }
    },
    {
      // Here we use a regex to match the home route.
      // This is useful if you want to match a route that has a dynamic path.
      // The "?:" is used to group the regex without capturing the match:
      path: /(?:^$|^\/home)/,
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
      path: "props",
      component: Props
    },
    {
      path: "protected",
      component: Protected
    },
    {
      path: "transitions",
      component: Transitions
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

<div class="flex h-screen flex-col gap-4 bg-zinc-950 p-4">
  <div class="flex">
    <div class="mt-3 flex flex-1 flex-col items-center justify-center">
      <div class="logo h-[130px] w-[360px]"></div>
    </div>
    <div class="flex flex-col justify-center gap-4">
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
  </div>
  <div class="flex-1 overflow-auto">
    <RouteWrapper
      name="main app router"
      title={{
        file: "src/app.svelte",
        content: "This is the main app component that contains the router and the routes."
      }}
      links={[
        {
          href: "/home",
          label: "/home"
        },
        {
          href: "/protected",
          label: "/protected"
        },
        {
          href: "/props",
          label: "/props"
        },
        {
          href: "/nested",
          label: "/nested"
        },
        {
          href: "/transitions",
          label: "/transitions"
        }
      ]}>
      <Router
        id="my-main-router"
        bind:instance
        {routes}
        statuses={{
          404: (routed: BadRouted) => {
            console.warn(
              `Route "${routed.path.before}" could not be found :(`,
              {
                statusName: getStatusByValue(routed.status),
                statusValue: routed.status
              },
              routed
            );
            return {
              component: NotFound,
              props: {
                somethingExtra: new Date().toISOString()
              }
            };
          }
        }} />
    </RouteWrapper>
  </div>
</div>
<div class="fixed bottom-0 right-10 overflow-hidden rounded-t-md border-2 border-b-0 bg-neutral-950 text-xs text-gray-400">
  <p class="flex items-center gap-1.5 bg-black/80 p-2 text-sm font-medium text-slate-400">
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
        <th class="px-3 py-2 text-left font-medium">Router Name</th>
        <th class="px-3 py-2 font-medium">Routes</th>
        <th class="px-3 py-2 font-medium">Active</th>
        <th class="px-3 py-2 font-medium">Current Path</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-800 text-center font-mono">
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
              <span class="text-green-500">yes</span>
            {:else}
              <span class="text-gray-500">no</span>
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

<style lang="scss">
  .logo {
    background-image: url("https://github.com/mateothegreat/svelte5-router/raw/main/docs/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
  }
</style>
