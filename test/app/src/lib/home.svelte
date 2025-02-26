<script lang="ts">
  import { route, type Route } from "@mateothegreat/svelte5-router";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import { myDefaultRouteConfig } from "./common-stuff";

  let props = $props();

  const routes: Route[] = [
    {
      component: snippet
    }
  ];
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-indigo-500 p-4">
    <strong>Click on a link above to see the params --^</strong>
    <em>Oh, and i'm a snippet that was rendered because I am the default route.</em>
  </div>
{/snippet}
<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <p class="rounded-sm bg-black p-2 text-center text-xs text-green-500">params.svelte</p>
  <p class="rounded-sm p-2 text-sm text-black">This demo shows how to use the `params` prop to pass the pattern groups from the current route to a component.</p>
  <div class="flex gap-2 rounded-sm bg-black p-4">
    Children Routes:
    <a
      use:route={myDefaultRouteConfig}
      href="/home"
      class="rounded-sm bg-blue-500 px-2">
      /home
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/home?someQueryParam=123"
      class="rounded-sm bg-blue-500 px-2">
      /home?someQueryParam=123
    </a>
  </div>
  <div class="rounded-sm bg-black p-4 shadow-xl">
    <pre class="rounded-md bg-gray-900 p-2 text-sm text-gray-400">props:
{JSON.stringify(props, null, 2)}</pre>
    <Router {routes} />
  </div>
</div>
