<script lang="ts">
  import { Router, type Route } from "@mateothegreat/svelte5-router";

  const routes: Route[] = [
    {
      path: "",
      component: snippet
    }
  ];
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-green-400 p-4">
    I'm a snippet!<br />
    You've reached the deepest level of nested routing (level-2)!
  </div>
{/snippet}

<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <p class="rounded-sm bg-black p-2 text-center text-xs text-green-500">/nested/level-1/level-2</p>

  <div class="rounded-sm bg-black p-4 shadow-xl">
    <Router basePath="/nested/level-1/level-2" {routes} />
  </div>
</div>
