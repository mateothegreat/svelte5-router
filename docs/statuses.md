# Route Statuses

Each router instance can have a set of statuses that are rendered when a route
returns a specific status code such as 404 for "Not Found".

## Status Codes

The following status codes are to be supported:

> [!NOTE]
> Currently, the `404` status code is implemented. We will be adding the
> other status codes in the future.

| Code    | Description           | Status          |
| ------- | --------------------- | --------------- |
| 400     | Bad Request           | Coming Soon     |
| 401     | Unauthorized          | Coming Soon     |
| 403     | Forbidden             | Coming Soon     |
| __404__ | __Not Found__         | __Implemented__ |
| 500     | Internal Server Error | Coming Soon     |

## Usage

In this example, we will use the `NotFound` component to render when the router
returns a 404 status code because the route `/bad` does not exist.

First, we will create the `NotFound` component:

```html
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

```html
<script lang="ts">
  import { Router } from "@mateothegreat/svelte5-router";
  import NotFound from "./lib/not-found.svelte";

  const routes: Route[] = [];
</script>

<Router
  {routes}
  statuses={{
    404: NotFound
  }} />
```

When you navigate to `/bad`, the `NotFound` component will be rendered because
the route `/bad` does not exist.
