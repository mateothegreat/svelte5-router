<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { goto, Router, type Route } from "@mateothegreat/svelte5-router";
  import Level_1 from "./level-1/level-1.svelte";
  const routes: Route[] = [
    {
      hooks: {
        pre: () => {
          goto("/nested/home");
        }
      }
    },
    {
      path: "level-1",
      component: Level_1
    },
    {
      path: "home",
      component: snippet
    }
  ];
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-green-500 p-4">
    Default path routed and output using a snippet.
    <br />
    <strong>Click on a link above to trigger nested routing..</strong>
  </div>
{/snippet}

<RouteWrapper
  router="my-main-router"
  name="/nested"
  title={{
    file: "src/routes/nested/nested.svelte",
    content: "This route is a child of the main app router where you are redirected to /home/welcome when landing on /home using a `pre` hook."
  }}
  links={[
    {
      href: "/nested/home",
      label: "/nested/home"
    },
    {
      href: "/nested/level-1",
      label: "/nested/level-1"
    }
  ]}>
  <Router
    id="nested-router"
    basePath="/nested"
    {routes} />
</RouteWrapper>
