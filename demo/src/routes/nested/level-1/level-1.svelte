<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { myDefaultRouterConfig } from "$lib/default-route-config";
  import { Router, RouterInstance } from "@mateothegreat/svelte5-router";
  import Level_2 from "./level-2/level-2.svelte";

  let router: RouterInstance = $state();
  let { route, foo } = $props();

  /**
   * Demonstrate how support for additional props is working.
   */
  console.log("additionalProps.foo in ../nested.svelte is passed to this component as:", foo);

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
  {router}
  name="/nested/level-1"
  {end}
  {route}
  title={{
    file: "src/routes/nested/level-1/level-1.svelte",
    content:
      "This demo shows how to use nested routing with the router where multiple routers can be nested within each other."
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
    bind:instance={router}
    routes={[
      {
        path: "level-2",
        component: Level_2,
        hooks: {
          pre: () => {
            console.log(`Route "/nested/level-1/level-2" matched (I'm a pre hook in the level-1.svelte route)`);
            return true;
          }
        }
      },
      /**
       * Default routes can be placed anywhere in the routes array
       * and will be matched if no other routes match regardless of
       * their position in the array:
       */
      {
        component: snippet
      }
    ]}
    {...myDefaultRouterConfig} />
</RouteWrapper>
