<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Code from "$lib/components/code.svelte";
  import InlineCode from "$lib/components/inline-code.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { myDefaultRouterConfig } from "$lib/default-route-config";
  import { RouterInstance, type Route, type RouteResult } from "@mateothegreat/svelte5-router";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import { Github, MessageCircleQuestion, Newspaper } from "lucide-svelte";

  let { route }: { route: RouteResult } = $props();
  let router: RouterInstance = $state();

  const routes: Route[] = [
    {
      // Starting paths with "/" is not required, but it's a good idea to
      // do so for clarity in some cases.
      //
      // The router will match this route if the path is "/welcome" or "/home/welcome"
      // because the base path is passed in as "/home" below.
      path: "/",
      component: welcome
    },
    {
      // Starting paths with "/" is not required, but it's a good idea to
      // do so for clarity in some cases.
      //
      // The router will match this route if the path is "/with-query-params" or "/home/with-query-params"
      // because the base path is passed in as "/home" below.
      path: "with-query-params",
      component: displayRouteProps
    }
  ];
</script>

{#snippet welcome()}
  <div class="flex flex-col gap-5 rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 text-sm text-slate-300">
    <h1 class="text-xl font-bold">Single Page Application Router (SPAR) for Svelte 5+</h1>
    <p>
      <InlineCode
        text="@mateothegreat/svelte5-router"
        class="bg-black text-blue-500" /> is an SPA router for Svelte that allows you to divide & conquer your app with nested
      routers, snippets, and more.
    </p>
    <div class="flex gap-3">
      <div
        class="flex h-9 cursor-pointer items-center gap-1 rounded-sm border-2 border-slate-400 bg-violet-600 p-2 transition-all duration-500 hover:bg-blue-600">
        <Newspaper class="h-5 w-5" />
        <a
          target="_blank"
          href="https://github.com/mateothegreat/svelte5-router/blob/main/docs/readme.md"
          class="">
          Documentation
        </a>
      </div>
      <div
        class="flex h-9 cursor-pointer items-center gap-1 rounded-sm border-2 border-slate-400 bg-slate-600 p-2 transition-all duration-500 hover:bg-blue-600">
        <Github class="h-5 w-5" />
        <a
          target="_blank"
          href="https://github.com/mateothegreat/svelte5-router"
          class="">
          GitHub Repository
        </a>
      </div>
      <div
        class="flex h-9 cursor-pointer items-center gap-1 rounded-sm border-2 border-slate-400 bg-slate-600 p-2 transition-all duration-500 hover:bg-blue-600">
        <MessageCircleQuestion class="h-5 w-5" />
        <a href="https://github.com/mateothegreat/svelte5-router/issues">GitHub Issues</a>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-indigo-400">Features</h2>
      <ul class="list-disc space-y-1 pl-6 text-slate-300">
        <li>Built for Svelte 5 🚀!</li>
        <li>Divide & conquer - use nested routers all over the place</li>
        <li class="text-teal-400">Use components, snippets, or both 🔥!</li>
        <li>Use regex paths (e.g. /foo/(.*?)/bar) and/or named parameters together</li>
        <li>Use async routes simply with component: async () => import("./my-component.svelte")</li>
        <li class="font-bold">Add hooks to your routes to control the navigation flow 🔧</li>
        <li>Automagic styling of your anchor tags 💄</li>
        <li>Helper methods 🛠️ to make your life easier</li>
        <li>Debugging tools included 🔍</li>
      </ul>
    </div>
    <div class="flex items-center">
      Get started now with
      <InlineCode
        text="npm install @mateothegreat/svelte5-router"
        class="mx-1 bg-black" />
      and check out the
      <a
        class="mx-1 cursor-pointer text-violet-400 hover:text-green-500 hover:underline"
        href="https://github.com/mateothegreat/svelte5-router/blob/main/docs/getting-started.md">
        getting started guide..
      </a>
    </div>
  </div>
{/snippet}

{#snippet displayRouteProps()}
  <div class="flex flex-col gap-4 border-t-2 border-slate-800 pt-4">
    <div class="flex flex-col gap-5">
      <div class="w-fit px-2 flex items-center gap-1 font-bold text-indigo-300 bg-gray-800 rounded-sm p-2">
        match path
        <InlineCode text={route.route.path.toString()} />
        to
        <InlineCode text={`${route.route.path}?someQueryParam=123`} />
      </div>
      <div class="flex flex-col gap-4 text-sm text-gray-400">
        <div class=" gap-1">
          This demo shows how to use the route's
          <InlineCode text="querystring" />
          configuration option to match against the current
          <InlineCode text="location.search" />
          value passed in by the browser.
        </div>
        <Badge
          variant="success"
          class="w-fit">
          Because we did not specify any <InlineCode text="querystring" /> parameters, the route render regardless of the
          <InlineCode text="querystring" /> and will be passed to the component as shown below.
        </Badge>
      </div>
    </div>
    <Code
      title={"{#snippet displayRouteProps()}"}
      file="src/routes/home.svelte">
      {JSON.stringify(route.result, null, 2)}
    </Code>
  </div>
{/snippet}

<RouteWrapper
  {router}
  name="home-router"
  {route}
  end={true}
  title={{
    file: "src/routes/home.svelte",
    content:
      "This route is a child of the main app router where you are redirected to /home/welcome when landing on /home using a `pre` hook."
  }}
  links={[
    {
      href: "/home",
      label: "/home",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/home/with-query-params?someQueryParam=123",
      label: "/home/with-query-params?someQueryParam=123"
    }
  ]}>
  <Router
    id="home-router"
    basePath="/home"
    bind:instance={router}
    {...myDefaultRouterConfig}
    {routes} />
</RouteWrapper>
