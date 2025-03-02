<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { getStatusByValue, StatusCode, type Route } from "@mateothegreat/svelte5-router";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import CustomNotFound from "./custom-not-found.svelte";
  import DisplayParamsAnother from "./display-params-another.svelte";
  import DisplayParams from "./display-params.svelte";
  import QueryMatch_1 from "./query-match-1.svelte";
  import QueryMatch_2 from "./query-match-2.svelte";

  const routes: Route[] = [
    {
      // This route will be used if there is no match above.
      component: snippet
    },
    {
      name: "props-query-match-2",
      path: "query-matcher",
      query: {
        value: 2
      },
      component: QueryMatch_2
    },
    {
      /**
       * /props/query-matcher?pagination=2,23
       * /props/query-matcher?pagination=2,23&company=123
       * /props/query-matcher?pagination=2,23&company=1234567
       * /props/query-matcher?pagination=2,23&company=1
       * /props/query-matcher?pagination=2,23&company=12
       */
      name: "props-query-matching",
      path: "/query-matcher",
      query: {
        // The "pagination" query param:
        // * must be present
        // * must be a number
        // + and then be followed by an optional "cursor"
        //   * if present, it must have a comma delimiter
        //   * and then be a string of alphanumeric characters:
        pagination: /^(?<page>\d+)(,(?<cursor>[a-z0-9]+))?$/,
        // The "company" query param is optional, and if present:
        // * can be empty
        // * must be a single number
        company: /^(\d+)?$/
      },
      component: QueryMatch_1,
      props: {
        metadata: {
          src: "props.svelte",
          routeName: "props-query-matching"
        }
      }
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
    },
    {
      path: /another\/(?<child>.*)/,
      component: DisplayParamsAnother,
      props: {
        another: {
          one: "works!"
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
      href: "/props/another/bar",
      label: "/props/another/bar"
    },
    {
      href: "/props/bar?someQueryParam=123",
      label: "/props/bar?someQueryParam=123"
    },
    {
      href: "/props/query-matcher?pagination=2,23&company=123",
      label: "/props/query-matcher?pagination=2,23&company=123"
    },
    {
      href: "/props/query-matcher?value=2",
      label: "/props/query-matcher?value=2"
    }
  ]}>
  <Router
    id="props-router"
    basePath="/props"
    {routes}
    hooks={{
      //
      // You could use a global auth guard here to run before every route:
      //   pre: (route: Routed) => {
      //     if (!isAuthenticated()) {
      //       console.warn("user is not authenticated, redirecting to login", route);
      //       return {
      //         component: NotGonnaMakeIt,
      //       };
      //     }
      //   }
      //
      // You could also use a global error handler here to run after every route:
      //   post: [
      //     (route: Routed) => {
      //       console.info("do some more work here", route);
      //       return true;
      //     },
      //     someLogMethod,
      //     finalMethod,
      //   ]
      //
    }}
    statuses={{
      [StatusCode.NotFound]: (path: string) => {
        console.warn(`the path "${path}" could not be found :(`, {
          // You could use the status name to make something pretty:
          status: getStatusByValue(StatusCode.NotFound),
          // You could also use the status code to something more dynamic:
          code: StatusCode.NotFound
        });
        // Now, we're going to return a new route that will be rendered by the router:
        return {
          component: CustomNotFound,
          // You can pass props to the component that is rendered if you need to
          // bubble up some extra information:
          props: {
            src: "props.svelte"
          }
        };
      }
    }} />
</RouteWrapper>
