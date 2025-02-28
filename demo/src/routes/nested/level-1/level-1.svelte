<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { Router, RouterInstance, type Route } from "@mateothegreat/svelte5-router";
  import Level_2 from "./level-2/level-2.svelte";

  const routes: Route[] = [
    {
      path: "level-2",
      component: Level_2
    },
    {
      component: snippet
    }
  ];

  let instance: RouterInstance;
  let { route } = $props();

  let end = $state(false);
  $effect(() => {
    console.log("instance", route, instance?.current.path);
    end = route.path.after === "/nested/level-1";
  });
</script>

{#snippet snippet()}
  <Container
    title={"{#snippet snippet()}"}
    file="src/routes/nested/level-1/level-1.svelte">
    <div class="flex flex-col items-center gap-6 p-10 text-center">
      <Badge>There was no path provided to the router, so the default route was used (declared as a snippet).</Badge>
      Click on a link above to see the different effects!
    </div>
  </Container>
{/snippet}

<RouteWrapper
  router="nested-level-1-router"
  name="/nested/level-1"
  {end}
  {route}
  title={{
    file: "src/routes/nested/level-1/level-1.svelte",
    content: "This demo shows how to use nested routing with the router where multiple routers can be nested within each other."
  }}
  links={[
    {
      href: "/nested/level-1",
      label: "default path",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/nested/level-1/level-2",
      label: "/nested/level-1/level-2"
    }
  ]}>
  <Router
    id="nested-level-1-router"
    basePath="/nested/level-1"
    bind:instance
    {routes} />
</RouteWrapper>
