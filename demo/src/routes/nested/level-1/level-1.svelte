<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { Router, type Route } from "@mateothegreat/svelte5-router";
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
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-green-500 p-4">
    Default path routed and output using a snippet.
    <br />
    <strong>Click on a link above to see the params..</strong>
  </div>
{/snippet}

<RouteWrapper
  router="nested-level-1-router"
  name="/nested/level-1"
  title={{
    file: "src/routes/nested/level-1/level-1.svelte",
    content: "This route is a child of the main app router where you are redirected to /home/welcome when landing on /home using a `pre` hook."
  }}
  links={[
    {
      href: "/nested/level-1",
      label: "/nested/level-1"
    },
    {
      href: "/nested/level-1/level-2",
      label: "/nested/level-1/level-2"
    }
  ]}>
  <Router
    id="nested-level-1-router"
    basePath="/nested/level-1"
    {routes} />
</RouteWrapper>
