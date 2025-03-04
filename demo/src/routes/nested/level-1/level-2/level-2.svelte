<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { myDefaultRouterConfig } from "$lib/default-route-config";
  import { Router, type Route } from "@mateothegreat/svelte5-router";
  import Level_3 from "./level-3/level-3.svelte";

  const routes: Route[] = [
    {
      path: "level-3",
      component: Level_3
    },
    {
      component: snippet
    }
  ];

  let { route } = $props();
</script>

{#snippet snippet()}
  <Container
    title={"{#snippet snippet()}"}
    file="src/routes/nested/level-1/level-2/level-2.svelte">
    <div class="flex flex-col items-center gap-6 p-10 text-center">
      <Badge>There was no path provided to the router, so the default route was used (declared as a snippet).</Badge>
      Click on a link above to see the different effects!
    </div>
  </Container>
{/snippet}

<RouteWrapper
  router="nested-level-2-router"
  name="/nested/level-2"
  end={true}
  {route}
  title={{
    file: "src/routes/nested/level-1/level-2/level-2.svelte",
    content:
      "This demo shows how to use nested routing with the router where multiple routers can be nested within each other."
  }}
  links={[
    {
      href: "/nested/level-1/level-2",
      label: "default path",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/nested/level-1/level-2/level-3",
      label: "/nested/level-1/level-2/level-3"
    }
  ]}>
  <Router
    id="nested-level-2-router"
    basePath="/nested/level-1/level-2"
    {routes}
    {...myDefaultRouterConfig} />
</RouteWrapper>
