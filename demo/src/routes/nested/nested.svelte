<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { myDefaultRouterConfig } from "$lib/default-route-config";
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

  let router: RouterInstance = $state();
  let { route } = $props();

  /**
   * This is a helper state variable that can be used to determine if the
   * current route is the same as the route that is being rendered so
   * that we can show a badge to indicate this is the last router in the
   * nested routing hierarchy.
   */
  let end = $state(false);
  $effect(() => {
    end = router.current?.result.path.condition === "default-match";
  });

  const additionalProps = {
    foo: {
      bar: "baz"
    }
  };
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
  {router}
  name="/nested"
  {route}
  {end}
  title={{
    file: "src/routes/nested/nested.svelte",
    content:
      "This demo shows how to use nested routing with the router where multiple routers can be nested within each other."
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
    bind:instance={router}
    {...myDefaultRouterConfig}
    {routes}
    {...additionalProps} />
</RouteWrapper>
