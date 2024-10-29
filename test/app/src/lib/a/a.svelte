<script lang="ts">
  import { Instance, route, Router, type Route } from "@mateothegreat/svelte5-router";
  import B from "./b/b.svelte";

  const routes: Route[] = [
    {
      path: "b",
      component: B
    }
  ];

  let instance: Instance;
</script>

<div class="flex flex-col gap-3 bg-gray-400 p-10">
  <p class="rounded-lg bg-black p-2 text-center text-xs text-green-500">a.svelte</p>
  <h1>Parent: A</h1>
  <div class="flex gap-2 rounded-lg bg-black p-4">
    <a use:route href="/a/b" class="rounded-lg bg-blue-500 px-2">/a/b</a>
  </div>
  <div class="rounded-lg bg-black p-4 shadow-xl">
    <Router bind:instance base="/a" {routes} />
  </div>
</div>
