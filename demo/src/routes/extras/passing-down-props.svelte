<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { RouterInstance } from "@mateothegreat/svelte5-router";
  import type { RouteConfig } from "@mateothegreat/svelte5-router/route.svelte";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import Dump from "./dump.svelte";

  let router: RouterInstance = $state();
  let { route } = $props();

  const routes: RouteConfig[] = [
    {
      component: Dump,
      props: {
        foo: "bar",
        baz: {
          awesome: true
        }
      }
    }
  ];
</script>

<RouteWrapper
  {router}
  name="passing-down-props"
  {route}
  end={true}
  title={{
    file: "src/routes/extras/passing-down-props.svelte"
  }}
  links={[
    {
      href: "/extras/passing-down-props",
      label: "default path"
    }
  ]}>
  <Router
    basePath="/extras/passing-down-props"
    bind:instance={router}
    myAdditionalProp="I was added to the <Router/> component directly."
    {routes} />
</RouteWrapper>
