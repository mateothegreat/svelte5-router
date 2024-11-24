<script lang="ts">
  import { route, Router, type Route } from "@mateothegreat/svelte5-router";
  import All from "./all.svelte";

  let { params }: { params: string[] } = $props();

  const routes: Route[] = [
    {
      path: "(?<route>.*)",
      component: All
    },
    {
      path: "",
      component: snippet
    }
  ];
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-green-400 p-4">
    I'm a snippet!<br />
    Click on a link above to see the params..
  </div>
{/snippet}

<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <p class="rounded-lg bg-black p-2 text-center text-xs text-green-500">params.svelte</p>
  <h1>Params Links</h1>
  <div class="flex gap-2 rounded-lg bg-black p-4">
    <a use:route href="/params/foo" class="rounded-lg bg-blue-500 px-2">/params/foo</a>
    <a use:route href="/params/bar" class="rounded-lg bg-blue-500 px-2">/params/bar</a>
  </div>
  <h1>Params Links</h1>

  <div class="rounded-lg bg-black p-4 shadow-xl">
    <Router {routes} />
  </div>
</div>
