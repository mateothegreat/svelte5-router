<script lang="ts">
  import { route, Router, type Route } from "@mateothegreat/svelte5-router";
  import Level_2 from "./level-2/level-2.svelte";

  const routes: Route[] = [
    {
      path: "level-2",
      component: Level_2
    },
    {
      path: "",
      component: snippet
    }
  ];
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-green-500 p-4">
    Default path routed and output using a snippet.<br />
    <strong>Click on a link above to see the params..</strong>
  </div>
{/snippet}

<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <p class="rounded-sm bg-slate-900 p-2 text-center text-xs text-green-500">/nested/level-1</p>
  <div class="flex gap-2 rounded-sm bg-black p-4">
    Level-1 Children Links: <a use:route href="/nested/level-1/level-2" class="rounded-sm bg-blue-500 px-2"
      >/nested/level-1/level-2</a>
  </div>

  <div class="rounded-sm bg-black p-4 shadow-xl">
    <Router basePath="/nested/level-1" {routes} />
  </div>
</div>
