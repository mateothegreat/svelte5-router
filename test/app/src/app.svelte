<script lang="ts">
  import { route, Router, type RouteConfig, type RouterInstance } from "@mateothegreat/svelte5-router";
  import TestA from "./routes/test-a/test-a.svelte";
  import TestB from "./routes/test-b/test-b.svelte";

  let instance: RouterInstance;

  const routes: RouteConfig[] = [
    {
      path: "/test-a",
      component: TestA,
      hooks: {
        pre: (r: RouteConfig) => {
          console.log(`pre hook for ${r.result.path.original}`, r.result.path);
          return true;
        },
        post: (r: RouteConfig) => {
          console.log(`post hook for ${r.result.path.original}`, r.result.path);
          return true;
        }
      }
    },
    {
      path: "/test-b",
      component: TestB,
      hooks: {
        pre: (r: RouteConfig) => {
          console.log(`pre hook for ${r.result.path.original}`, r.result.path);
          return true;
        },
        post: (r: RouteConfig) => {
          console.log(`post hook for ${r.result.path.original}`, r.result.path);
          return true;
        }
      }
    }
  ];
</script>

<h1 class="bg-zinc-950/95 p-2 font-medium text-emerald-400">@mateothegreat/svelte5-router test</h1>

<div class="m-2 flex flex-col gap-2">
  <div class="flex flex-col gap-4 rounded-md border-2 border-gray-300 bg-zinc-500 p-2 text-sm font-medium text-white">
    <div class="group flex gap-4">
      <a use:route href="/test-a" class="hover:text-blue-600 hover:underline">/test-a</a>
      <a use:route href="/test-b" class="hover:text-blue-600 hover:underline">/test-b</a>
    </div>
  </div>
  <div class="m-1 flex flex-col gap-4 rounded-md bg-slate-200 p-4">
    <Router bind:instance {routes} />
  </div>
</div>
