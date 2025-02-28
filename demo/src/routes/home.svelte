<script lang="ts">
  import Code from "$lib/components/code.svelte";
  import InlineCode from "$lib/components/inline-code.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { goto, type Route } from "@mateothegreat/svelte5-router";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import { Github, MessageCircleQuestion, Newspaper } from "lucide-svelte";

  let props = $props();

  const routes: Route[] = [
    {
      // This route will redirect to the welcome route when
      // no path is provided (i.e.: "/home" vs "/home/welcome"):
      hooks: {
        pre: () => {
          goto("/home/welcome");
        }
      }
    },
    {
      path: "/welcome",
      component: welcome
    },
    {
      path: "/with-query-params",
      component: displayParams
    }
  ];
</script>

{#snippet welcome()}
  <div class="flex flex-col gap-5 rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 text-sm text-slate-300">
    <h1 class="text-xl font-bold">Single Page Application Router (SPAR) for Svelte 5+</h1>
    <p>
      <InlineCode
        text="@mateothegreat/svelte5-router"
        class="bg-black text-blue-500" /> is an SPA router for Svelte that allows you to divide & conquer your app with nested routers, snippets, and more.
    </p>
    <div class="flex gap-3">
      <div class="flex h-9 cursor-pointer items-center gap-1 rounded-sm border-2 border-slate-400 bg-violet-600 p-2 transition-all duration-500 hover:bg-blue-600">
        <Newspaper class="h-5 w-5" />
        <a
          target="_blank"
          href="https://github.com/mateothegreat/svelte5-router/blob/main/docs/readme.md"
          class="">
          Documentation
        </a>
      </div>
      <div class="flex h-9 cursor-pointer items-center gap-1 rounded-sm border-2 border-slate-400 bg-slate-600 p-2 transition-all duration-500 hover:bg-blue-600">
        <Github class="h-5 w-5" />
        <a
          target="_blank"
          href="https://github.com/mateothegreat/svelte5-router"
          class="">
          GitHub Repository
        </a>
      </div>
      <div class="flex h-9 cursor-pointer items-center gap-1 rounded-sm border-2 border-slate-400 bg-slate-600 p-2 transition-all duration-500 hover:bg-blue-600">
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

{#snippet displayParams()}
  {@const code = "{JSON.stringify(props.route.query, null, 2)}"}
  <div class="flex flex-col gap-3 rounded-md border-2 border-indigo-300 bg-indigo-500 p-3">
    <div>
      The route is mapped to <InlineCode text="/home/with-query-params" />
      and it's <InlineCode text="component" /> property is using a snippet that renders <InlineCode text={code} />
    </div>
    <Code title="props.route.query:">
      <div>{JSON.stringify(props.route.query, null, 2)}</div>
    </Code>
  </div>
{/snippet}

<RouteWrapper
  router="my-main-router"
  name="/home"
  title={{
    file: "src/routes/home.svelte",
    content: "This route is a child of the main app router where you are redirected to /home/welcome when landing on /home using a `pre` hook."
  }}
  links={[
    {
      href: "/home/welcome",
      label: "/home/welcome"
    },
    {
      href: "/home/with-query-params?someQueryParam=123",
      label: "/home/with-query-params?someQueryParam=123"
    }
  ]}>
  <Router
    id="home-router"
    basePath="/home"
    {routes} />
</RouteWrapper>
