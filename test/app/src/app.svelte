<script lang="ts">
  import type { Route } from "@mateothegreat/svelte5-router";
  import { route, Router } from "@mateothegreat/svelte5-router";
  import A from "./lib/a/a.svelte";
  import Default from "./lib/default.svelte";
  import Params from "./lib/params/params.svelte";

  const routes: Route<any>[] = [
    {
      path: "/",
      component: Default
    },
    {
      path: "a",
      component: A
    },
    {
      path: "params",
      component: Params
    }
  ];
</script>

<div class="absolute flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-900 p-10">
  <h1 class="text-center text-sm font-semibold text-indigo-500">Svelte SPA Router Demo</h1>

  <div class="flex gap-2">
    <a use:route href="/" class="rounded-lg bg-blue-500 px-2">/</a>
    <a use:route href="/a" class="rounded-lg bg-blue-500 px-2">/a</a>
    <a use:route href="/params" class="rounded-lg bg-blue-500 px-2">/params</a>
  </div>
  <div class="flex w-96 flex-col gap-4 rounded-lg bg-black p-4 shadow-xl">
    <p class="text-center text-xs text-zinc-500">app.svelte</p>
    <Router base="/" {routes} />
  </div>
</div>
