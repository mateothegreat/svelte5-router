<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { myDefaultRouterConfig } from "$lib/default-route-config";
  import Home from "$routes/home.svelte";
  import Nested from "$routes/nested/nested.svelte";
  import PathsAndParams from "$routes/paths-and-params/paths-and-params.svelte";
  import Protected from "$routes/protected/main.svelte";
  import Transitions from "$routes/transitions/transitions.svelte";
  import { goto, registry, type Route, Router, type RouterInstance } from "@mateothegreat/svelte5-router";
  import { BookHeart, Github, HelpCircle } from "lucide-svelte";

  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      import.meta.hot!.invalidate();
    });
  }

  // This is a state variable that will hold the router instance.
  // It can be used to access the current route, navigate, etc:
  let instance: RouterInstance;

  $effect(() => {
    if (instance.current) {
      console.log(
        `🚀 I'm an $effect in app.svelte and i'm running because the current route is now ${instance.current.result.path.original}!`
      );
    }
  });

  const routes: Route[] = [
    {
      // You can name your routes for tracking or debugging:
      name: "default-route",
      hooks: {
        pre: () => {
          console.log("redirecting to /home using a pre hook!");
          goto("/home");
          return false;
        }
      }
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
        }
      ]}>
      <Router
        id="my-main-router"
        bind:instance
        {routes}
        {...myDefaultRouterConfig} />
    </RouteWrapper>
  </div>
</div>
<div
  class="fixed bottom-0 right-10 overflow-hidden rounded-t-md border-2 border-b-0 bg-neutral-950 text-xs text-gray-400">
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

<style>
  .logo {
    background-image: url("https://github.com/mateothegreat/svelte5-router/raw/main/docs/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
  }
</style>
