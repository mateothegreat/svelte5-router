<script lang="ts">
  import type { Route } from "@mateothegreat/svelte5-router";
  import { route, Router } from "@mateothegreat/svelte5-router";
  import A from "./lib/a/a.svelte";
  import Default from "./lib/default.svelte";
  import Params from "./lib/params/params.svelte";
  import Protected from "./lib/protected/protected.svelte";

  const routes: Route[] = [
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
    },
    {
      path: "protected",
      component: Protected,
      pre: () => {
        // Crude example of checking if the user is logged in:
        if (!localStorage.getItem("token")) {
          alert("You must be logged in to view this page!");
          // By returning false, the route will not be rendered and the
          // user will stay at the current route:
          return false;
        }
        return true;
      },
      post: () => {
        console.log("post");
      }
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
