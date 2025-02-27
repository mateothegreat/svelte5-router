<script lang="ts">
  import { route, Router, type Route } from "@mateothegreat/svelte5-router";
  import { fade } from "svelte/transition";
  import { myDefaultRouteConfig } from "../common-stuff";
  import One from "./one.svelte";
  import Two from "./two.svelte";

  const routes: Route[] = [
    {
      component: snippet
    },
    {
      path: "one",
      component: One
    },
    {
      path: "two",
      component: Two
    }
  ];
</script>

{#snippet snippet()}
  <div
    class="flex flex-col gap-3 bg-green-500 p-4"
    in:fade={{ duration: 300 }}>
    Default path routed and output using a snippet.
    <br />
    <strong>Click on a link above..</strong>
  </div>
{/snippet}
<div class="flex flex-col gap-3 bg-slate-600 p-10">
  <p class="rounded-sm bg-slate-900 p-2 text-center text-xs text-green-500">transitions.svelte</p>
  <h1 class="text-xl font-bold text-white">Transitions Demo</h1>
  <div class="text-sm text-slate-300">
    <p>Transitions are applied at the content level rather than within the router itself.</p>
    <p>This allows for more flexibility in how transitions are applied and reduces the complexity of the router.</p>
  </div>
  <div class="flex gap-2 rounded-sm bg-black p-4">
    <a
      use:route={myDefaultRouteConfig}
      href="/transitions/one"
      class="rounded-sm bg-blue-500 px-2">
      /transitions/one
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/transitions/two"
      class="rounded-sm bg-blue-500 px-2">
      /transitions/two
    </a>
  </div>
  <div class="rounded-sm bg-black p-4 shadow-xl">
    <Router
      basePath="/transitions"
      children={routes}
      {routes} />
  </div>
</div>
