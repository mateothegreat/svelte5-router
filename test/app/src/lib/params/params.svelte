<script lang="ts">
  import { Instance, route, Router, type Route } from "@mateothegreat/svelte5-router";
  import All from "./all.svelte";

  const routes: Route<any>[] = [
    {
      path: "/(.*?)$",
      component: All
    }
  ];

  let instance: Instance;
</script>

<div class="flex flex-col gap-3 bg-gray-400 p-10">
  <p class="rounded-lg bg-black p-2 text-center text-xs text-green-500">params.svelte</p>
  <h1>Params</h1>
  <div class="flex gap-2 rounded-lg bg-black p-4">
    <a use:route href="/params/foo" class="rounded-lg bg-blue-500 px-2">/params/foo</a>
    <a use:route href="/params/bar" class="rounded-lg bg-blue-500 px-2">/params/bar</a>
  </div>
  <div class="rounded-lg bg-black p-4 shadow-xl">
    <Router bind:instance base="/params" {routes} />
  </div>
</div>
