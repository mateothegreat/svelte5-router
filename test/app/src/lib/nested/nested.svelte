<script lang="ts">
  import { route, Router, type Route } from "@mateothegreat/svelte5-router";
  import { myDefaultRouteConfig } from "../common-stuff";
  import Level_1 from "./level-1/level-1.svelte";
  const routes: Route[] = [
    {
      path: "level-1",
      component: Level_1
    },
    {
      path: "",
      component: snippet
    }
  ];
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-green-500 p-4">
    Default path routed and output using a snippet.
    <br />
    <strong>Click on a link above to trigger nested routing..</strong>
  </div>
{/snippet}

<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <div class="flex gap-2 rounded-sm bg-black p-4">
    Nested Child Links:
    <a
      use:route={myDefaultRouteConfig}
      href="/nested/level-1"
      class="rounded-sm bg-blue-500 px-2">
      /nested/level-1
    </a>
  </div>

  <div class="rounded-sm bg-black p-4 shadow-xl">
    <Router
      basePath="/nested"
      {routes} />
  </div>
</div>
