<script lang="ts">
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
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 rounded-md border-2 border-slate-900/80 p-4 text-gray-400">
    <strong>Click on a link above to see the params --^</strong>
    <em>Oh, and i'm a snippet that was rendered because I am the default route.</em>
  </div>
{/snippet}

<RouteWrapper
  router="my-main-router"
  name="/props"
  title={{
    file: "src/routes/props/props.svelte",
    content: "This demo shows how to use the `params` prop to pass the pattern groups from the current route to a component."
  }}
  links={[
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
