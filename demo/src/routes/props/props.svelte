<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { type Route } from "@mateothegreat/svelte5-router";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import DisplayParams from "./display-params.svelte";

  const routes: Route[] = [
    {
      // This route will be used if there is no match above.
      component: snippet
    },
    {
      // This route will match any path and pass the pattern groups
      // as an object to the component that is passed in $props().
      //
      // The component will access the params using $props() and the
      // property "child" will contain the value extracted from the path.
      name: "props-fancy-regex",
      path: /\/(?<child>.*)/,
      component: DisplayParams,
      props: {
        randomId: Math.random().toString(36).substring(2, 15),
        someUserStuff: {
          username: "mateothegreat",
          userAgent: navigator.userAgent
        }
      }
    }
  ];

  let { route } = $props();
</script>

{#snippet snippet()}
  <Container
    title={"{#snippet snippet()}"}
    file="src/routes/props/props.svelte">
    <div class="flex flex-col items-center gap-6 p-10 text-center">
      <Badge>There was no path provided to the router, so the default route was used (declared as a snippet).</Badge>
      Click on a link above to see the different effects!
    </div>
  </Container>
{/snippet}

<RouteWrapper
  router="props-router"
  name="/props"
  {route}
  end={true}
  title={{
    file: "src/routes/props/props.svelte",
    content: "This demo shows how to pass values downstream to the component that is rendered."
  }}
  links={[
    {
      href: "/props",
      label: "default path",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/props/foo",
      label: "/props/foo"
    },
    {
      href: "/props/bar?someQueryParam=123",
      label: "/props/bar?someQueryParam=123"
    }
  ]}>
  <Router
    id="props-router"
    basePath="/props"
    {routes}
    hooks={{
      // pre: globalAuthGuardHook
    }} />
</RouteWrapper>
