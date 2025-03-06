<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { getStatusByValue, RouterInstance, StatusCode } from "@mateothegreat/svelte5-router";
  import type { RouteConfig } from "@mateothegreat/svelte5-router/route.svelte";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import { onDestroy } from "svelte";
  import CustomNotFound from "./custom-not-found.svelte";
  import DisplayParams from "./display-params.svelte";
  import QuerystringMatching from "./querystring-matching.svelte";

  let router: RouterInstance = $state();
  let { route } = $props();

  let randoms = $state({
    float: (Math.random() * 1000).toFixed(2),
    int: (Math.random() * 1000).toFixed(0),
    string: (Math.random() * 1000).toFixed(2).toString()
  });

  const interval = setInterval(() => {
    randoms.float = (Math.random() * 1000).toFixed(2);
    randoms.int = (Math.random() * 1000).toFixed(0);
    randoms.string = (Math.random() * 1000).toFixed(2).toString();
  }, 750);

  onDestroy(() => {
    clearInterval(interval);
  });

  const routes: RouteConfig[] = [
    /**
     * This route will be used if there is no matching routes we
     * define below:
     */
    {
      component: snippet
    },
    /**
     * For this route, use querystring to match against the current location.search value:
     *
     *   ✅ /paths-and-params/query-matcher?number=2&number-as-string=2
     *   ✅ /paths-and-params/query-matcher?number=2.1&number-as-string=2.345
     *   ❌ /paths-and-params/query-matcher?number=2&number-as-string=two
     */
    {
      name: "match-number-and-string",
      path: "query-matcher",
      component: QuerystringMatching,
      querystring: {
        /**
         * The "number" querystring parameter:
         *
         *   - ✅ must be present
         *   - ✅ must be a number or a string that can be converted to a number
         */
        float: /^([\d.]+)$/,
        /**
         * The "number-as-string" querystring parameter:
         *
         *   - ✅ must be present
         *   - ✅ must be a number or a string that can be converted to a number
         */
        string: "123"
      }
    },
    /**
     * For this route, use querystring to match against the current location.search value:
     *
     *   ✅ /paths-and-params/query-matcher?pagination=1,10
     *   ✅ /paths-and-params/query-matcher?pagination=1&company=123
     *   ✅ /paths-and-params/query-matcher?pagination=1&company=1234567
     *   ✅ /paths-and-params/query-matcher?pagination=2,20&company=123
     *   ✅ /paths-and-params/query-matcher?pagination=2,20&company=1234567
     *   ❌ /paths-and-params/query-matcher?pagination=1,&company=123
     *   ❌ /paths-and-params/query-matcher?pagination=&company=123
     *   ❌ /paths-and-params/query-matcher?pagination=2,3,4
     *   ❌ /paths-and-params/query-matcher?pagination=bad-value
     */
    {
      name: "match-pagination",
      path: "query-matcher",
      component: QuerystringMatching,
      querystring: {
        /**
         * The "pagination" querystring parameter:
         *
         *   - ✅ must be present
         *   - ✅ must be a number
         *   - ❔ and then be followed by an optional "cursor" parameter:
         *     - ✅ it must have a comma delimiter
         *     - ✅ it must be a string of alphanumeric characters only
         */
        pagination: /^(?<page>\d+)(?:,(?<cursor>\d+))?$/,
        /**
         * The "company" querystring parameter is optional, but if present:
         *
         *   - ✅ can be empty
         *   - ✅ must be a single number
         */
        company: /^(\d+)?$/
      },
      props: {
        metadata: {
          src: "paths-and-params.svelte"
        }
      }
    },
    /**
     * This route will match any path and pass the pattern groups
     * as an object to the component that is passed in $props().
     *
     * The component will access the params using $props() and the
     * property "child" will contain the value extracted from the path.
     */
    {
      name: "fancy-regex-capture-group",
      path: /^\/(?<child>(foo|bar))$/,
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
  <Container
    title={"{#snippet snippet()}"}
    file="src/routes/paths-and-params/paths-and-params.svelte">
    <div class="flex flex-col items-center gap-6 p-10 text-center">
      <Badge>There was no path provided to the router, so the default route was used (declared as a snippet).</Badge>
      Click on a link above to see the different effects!
    </div>
  </Container>
{/snippet}

<RouteWrapper
  {router}
  name="/paths-and-params"
  {route}
  end={true}
  title={{
    file: "src/routes/paths-and-params/paths-and-params.svelte",
    content: "This demo shows how to pass values downstream to the component that is rendered."
  }}
  links={[
    {
      href: "/paths-and-params",
      label: "default path",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/paths-and-params/foo",
      label: "foo"
    },
    {
      href: "/paths-and-params/query-matcher?pagination=2,23&company=123",
      label: "query-matcher?pagination=2,23&company=123"
    },
    {
      href: `/paths-and-params/query-matcher?string=123&float=${randoms.float}`,
      label: `query-matcher?string=123&float=${randoms.float}`
    }
  ]}>
  <Router
    id="props-router"
    basePath="/paths-and-params"
    bind:instance={router}
    {routes}
    hooks={{
      /**
       * You could use a global auth guard here to run before every route:
       *
       * hooks={{
       *   pre: (route: Routed) => {
       *     if (!isAuthenticated()) {
       *       console.warn("user is not authenticated, redirecting to login", route);
       *       return {
       *         component: NotGonnaMakeIt,
       *       };
       *     }
       *   }
       * }}
       *
       * You could also use a global error handler here to run after every route:
       *
       * hooks={{
       *   post: [
       *     (route: Routed) => {
       *       console.info("do some more work here", route);
       *       return true;
       *     },
       *     someLogMethod,
       *     finalMethod,
       *   ]
       * }}
       */
    }}
    statuses={{
      [StatusCode.NotFound]: (path: string) => {
        console.warn(`the path "${path}" could not be found :(`, {
          /**
           * You could use the status name to make something pretty:
           */
          status: getStatusByValue(StatusCode.NotFound),
          /**
           * You could also use the status code to something more dynamic:
           */
          code: StatusCode.NotFound
        });
        /**
         * Now, we're going to return a new route that will be rendered by the router:
         */
        return {
          component: CustomNotFound,
          /**
           * You can pass props to the component that is rendered if you need to
           * share some extra information:
           */
          props: {
            src: "props.svelte"
          }
        };
      }
    }} />
</RouteWrapper>
