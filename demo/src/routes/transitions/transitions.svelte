<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { Router, RouterInstance, type Route } from "@mateothegreat/svelte5-router";
  import Fade from "./fade.svelte";
  import Slide from "./slide.svelte";

  let { route } = $props();
  let instance: RouterInstance;

  const routes: Route[] = [
    {
      component: snippet
    },
    {
      path: "fade",
      component: Fade,
      props: {
        file: "src/routes/transitions/fade.svelte"
      }
    },
    {
      path: "slide",
      component: Slide,
      props: {
        file: "src/routes/transitions/slide.svelte"
      }
    }
  ];

  let file = $state<string>();
  $effect(() => {
    file = instance?.current.props?.file || "src/routes/transitions/transitions.svelte";
  });
</script>

{#snippet snippet()}
  <Container
    title={"{#snippet snippet()}"}
    file="src/routes/transitions/transitions.svelte">
    <div class="flex flex-col items-center gap-6 p-10 text-center">
      <Badge>There was no path provided to the router, so the default route was used (declared as a snippet).</Badge>
      Click on a link above to see the different effects!
    </div>
  </Container>
{/snippet}

<RouteWrapper
  router="transitions-router"
  name="/transitions"
  {route}
  end={true}
  title={{
    file,
    content: "Demo to show how to use transitions with the router (spoiler: they're applied at the content level rather than within the router itself)."
  }}
  links={[
    {
      href: "/transitions",
      label: "default path",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/transitions/fade",
      label: "/transitions/fade"
    },
    {
      href: "/transitions/slide",
      label: "/transitions/slide"
    }
  ]}>
  <Router
    id="transitions-router"
    basePath="/transitions"
    bind:instance
    {routes} />
</RouteWrapper>
