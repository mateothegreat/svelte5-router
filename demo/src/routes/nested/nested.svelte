<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { Router, RouterInstance, type Route } from "@mateothegreat/svelte5-router";
  import Level_1 from "./level-1/level-1.svelte";
  const routes: Route[] = [
    {
      component: snippet
    },
    {
      path: "level-1",
      component: Level_1
    }
  ];

  let { route } = $props();

  let end = $state(false);
  let instance: RouterInstance;
  let file = $state<string>();
  $effect(() => {
    file = instance?.current.props?.file || "src/routes/nested/nested.svelte";
  });
</script>

{#snippet snippet()}
  <Container
    title={"{#snippet snippet()}"}
    file="src/routes/nested/nested.svelte">
    <div class="flex flex-col items-center gap-6 p-10 text-center">
      <Badge>There was no path provided to the router, so the default route was used (declared as a snippet).</Badge>
      Click on a link above to see the different effects!
    </div>
  </Container>
{/snippet}

<RouteWrapper
  router="nested-router"
  name="/nested"
  {route}
  {end}
  title={{
    file: "src/routes/nested/nested.svelte",
    content: "This demo shows how to use nested routing with the router where multiple routers can be nested within each other."
  }}
  links={[
    {
      href: "/nested",
      label: "default path",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/nested/level-1",
      label: "/nested/level-1"
    }
  ]}>
  <Router
    id="nested-router"
    basePath="/nested"
    bind:instance
    {routes} />
</RouteWrapper>
