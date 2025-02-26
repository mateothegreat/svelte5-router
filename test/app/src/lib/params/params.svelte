<script lang="ts">
  import { Instance, route, type Route } from "@mateothegreat/svelte5-router";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import { myDefaultRouteConfig } from "../common-stuff";
  import DisplayParams from "./display-params.svelte";

  const routes: Route[] = [
    {
      // This route will be used if there is no match above.
      component: snippet
    },
    {
      // This route will match any path and pass the pattern groups
      // as an object to the component that is passed in $props().
      //
      // The component will access the params using $props() and the
      // property "child" will contain the value extracted from the path.
      path: /\/(?<child>.*)/,
      component: DisplayParams
    }
  ];

  let instance = $state<Instance>(null);
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-indigo-500 p-4">
    <strong>Click on a link above to see the params --^</strong>
    Click on a link above to see the params --^
    <em>Oh, and i'm a snippet that was rendered because I am the default route.</em>
  </div>
{/snippet}

<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <p class="rounded-sm bg-black p-2 text-center text-xs text-green-500">params.svelte</p>
  <p class="rounded-sm p-2 text-sm text-black">This demo shows how to use the `params` prop to pass the pattern groups from the current route to a component.</p>
  <div class="flex gap-2 rounded-sm bg-black p-4">
    Children Routes: <a
      use:route={myDefaultRouteConfig}
      href="/params/foo"
      class="rounded-sm bg-blue-500 px-2">
      /params/foo
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/params/bar"
      class="rounded-sm bg-blue-500 px-2">
      /params/bar
    </a>
    <a
      use:route={myDefaultRouteConfig}
      href="/params/one"
      class="rounded-sm bg-blue-500 px-2">
      /params/one
    </a>
  </div>
  <div class="rounded-sm bg-black p-4 shadow-xl">
    <!-- `basePath` is passed in so that the underlying routing
         engine knows to use this router instance for routes that
         start with "/params". -->
    <Router
      id="params-top-level-router"
      basePath="/params"
      {routes}
      bind:instance />
  </div>
</div>
