<script lang="ts">
  import { myDefaultRouteConfig } from "$lib/default-route-config";
  import { route, Router, type Route } from "@mateothegreat/svelte5-router";

  const routes: Route[] = [
    {
      path: "child",
      component: async () => import("./child.svelte")
    },
    {
      component: snippet
    }
  ];
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-green-500 p-4">
    Default path routed and output using a snippet.
    <br />
    <strong>Click on a link above..</strong>
  </div>
{/snippet}
<div class="flex flex-col gap-3 bg-gray-400 p-10">
  <p class="rounded-md bg-slate-900 p-2 text-center text-xs text-green-500">/async.svelte</p>
  <h1>Parent: AsyncFunction</h1>
  <div class="flex gap-2 rounded-md bg-black p-4">
    <a
      use:route={myDefaultRouteConfig}
      href="/async/child"
      class="rounded-md bg-blue-500 px-2">
      /async/child
    </a>
  </div>
  <div class="rounded-md bg-black p-4 shadow-xl">
    <Router
      basePath="/async"
      children={routes}
      {routes} />
  </div>
</div>
