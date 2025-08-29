<script lang="ts">
  import { route, Router, type RouteConfig } from "@mateothegreat/svelte5-router";
  import TestA from "./routes/test-a/test-a.svelte";
  import TestB from "./routes/test-b/test-b.svelte";

  const routes: RouteConfig[] = [
    {
      path: "/test-a",
      component: TestA
    },

    {
      path: "/test-b",
      component: TestB
    }
  ];
</script>

<h1 class="text-3xl font-bold underline">@mateothegreat/svelte5-router test</h1>

<div class="m-4 flex flex-col gap-4 rounded-md border-2 border-gray-300 p-4">
  <div class="group flex gap-4">
    <a use:route href="/test-a" class="hover:text-blue-600 hover:underline">Test A</a>
    <a use:route href="/test-b" class="hover:text-blue-600 hover:underline">Test B</a>
  </div>
</div>

<div class="m-4 flex flex-col gap-4 rounded-md border-2 border-gray-300 p-4">
  <Router {routes} />
</div>
