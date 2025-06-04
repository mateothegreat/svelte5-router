<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { RouterInstance } from "@mateothegreat/svelte5-router";
  import type { RouteConfig } from "@mateothegreat/svelte5-router/route.svelte";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import { onDestroy } from "svelte";
  import PassingDownProps from "./passing-down-props.svelte";

  let router: RouterInstance = $state();
  let { route } = $props();

  let randoms = $state({
    float: (Math.random() * 1000).toFixed(2),
    int: (Math.random() * 1000).toFixed(0),
    string: (Math.random() * 1000).toFixed(2).toString()
  });

  const interval = setInterval(() => {
    randoms.float = (Math.random() * 1000).toFixed(2);
    randoms.int = (Math.random() * 1000).toFixed(0);
    randoms.string = (Math.random() * 1000).toFixed(2).toString();
  }, 750);

  onDestroy(() => {
    clearInterval(interval);
  });

  const routes: RouteConfig[] = [
    {
      component: overview
    },
    {
      path: "passing-down-props",
      component: PassingDownProps,
      props: {
        route: "passing-down-props"
      },
      hooks: {
        pre: () => {
          console.log("pre");
          return true;
        }
      }
    }
  ];
</script>

{#snippet overview()}
  <div class="p-2">
    <div class="flex flex-col items-center gap-2 text-center text-slate-400">
      <div class="flex max-w-3xl flex-col gap-2 text-sm text-slate-500">
        <p class="text-fuchsia-500">Extra & cool stuff can be demoed here.</p>
        <p>Click a route above to see the different effects!</p>
      </div>
    </div>
  </div>
{/snippet}

<RouteWrapper
  {router}
  name="extras"
  {route}
  title={{
    file: "src/routes/extras/extras.svelte"
  }}
  links={[
    {
      href: "/extras/passing-down-props",
      label: "passing-down-props"
    }
  ]}>
  <Router
    basePath="/extras"
    bind:instance={router}
    {routes} />
</RouteWrapper>
