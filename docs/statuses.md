# Route Statuses

Each router instance can have a set of statuses that are rendered when a route
returns a specific status code such as 404 for "Not Found".

When a route returns a status code, the router will render the component or execute the function
specified in the `statuses` prop for that status code.

## Status Codes

Using the `StatusesMapping` enum, the following status codes are to be supported:

> [!NOTE]
> Currently, the `404` status code is implemented. We will be adding the
> other status codes in the future.

| Code    | Description           | Status          |
| ------- | --------------------- | --------------- |
| 301     | Permanent Redirect    | Coming Soon     |
| 302     | Temporary Redirect    | Coming Soon     |
| 400     | Bad Request           | Coming Soon     |
| 401     | Unauthorized          | Coming Soon     |
| 403     | Forbidden             | Coming Soon     |
| __404__ | __Not Found__         | __Implemented__ |
| 500     | Internal Server Error | Coming Soon     |

## `BadRouted` Object

When passing a function to the `statuses` value, the [`BadRouted`](../src/lib/routed.ts) object is passed to that function.

It contains the following properties:

- `path`: The path that was attempted to be accessed
- `status`: The status code that was returned

## Usage

### Basic Usage

In this example, we will use the `NotFound` component to render when the router
returns a 404 status code because the route `/bad` does not exist.

First, we will create the `NotFound` component:

```svelte
<script lang="ts">
  let props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-4">
  <pre class="rounded-md bg-gray-800 p-2 text-sm text-emerald-500">included from "not-found.svelte":</pre>
  <h1 class="text-2xl font-bold">404 not found :(</h1>
  <p class="text-sm text-gray-500">The page you are looking for does not exist.</p>
  <pre class="rounded-md bg-gray-900 p-2 text-sm text-gray-400">
    $props():
    {JSON.stringify(props, null, 2)}
  </pre>
</div>
```

Next, we will create the `Router` component and pass the `NotFound` component
to the `statuses` prop:

```svelte
<script lang="ts">
  import { Router, Route, StatusCode } from "@mateothegreat/svelte5-router";
  import NotFound from "./lib/not-found.svelte";

  const routes: Route[] = [
    // add routes here
  ];
</script>

<Router
  {routes}
  statuses={{
    [StatusCode.NotFound]: NotFound
  }} />
```

When you navigate to `/bad`, the `NotFound` component will be rendered because
the route `/bad` does not exist.

### Custom Usage

You can also pass a function to the `statuses` prop to have more control over the rendered component. The function receives a `BadRouted` object containing information about the failed route and must return an object with the component to render and any additional props:

```svelte
<script lang="ts">
  import { Router, Route, StatusCode } from "@mateothegreat/svelte5-router";
  import NotFound from "./lib/not-found.svelte";

  const routes: Route[] = [
    // add routes here
  ];
</script>

<Router
  id="my-main-router"
  bind:instance
  {routes}
  statuses={{
     [StatusCode.NotFound]: (routed: BadRouted) => {
      console.warn(
        `Route "${routed.path.before}" could not be found :(`,
        {
          statusName: getStatusByValue(routed.status),
          statusValue: routed.status
        },
        routed
      );
      return {
        component: NotFound,
        props: {
          somethingExtra: new Date().toISOString()
        }
      };
    }
  }} />
```

In this example, when a 404 error occurs:

1. The function logs a warning with details about the failed route
2. Returns the `NotFound` component with an additional prop `somethingExtra` containing the current timestamp
3. The `NotFound` component will receive both its default props and the extra props specified in the function
