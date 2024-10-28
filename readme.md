# Svelte Routing like a boss

An SPA router for Svelte that allows you to divide & conquer your app with nested routers.

- Supports Svelte 5 🚀!
- Divide & conquer - use nested routers all over the place.
- Supports regex paths (e.g. `/foo/(.*?)/bar`) 🔥.
- Supports named parameters.

## Installation

```bash
npm install @mateothegreat/svelte5-router
```

## Usage

All you need to do is define your routes and then use the `Router` component with the `routes` array.

To make a link, use the `route` directive with the `href` attribute such as `<a use:route href="/foo">foo</a>`.

### Route Paths

You can simply use static paths like `/foo` or dynamic paths like `/foo/(.*?)` with regex.

| Pattern             | Description                         |
| ------------------- | ----------------------------------- |
| `/`                 | The root path.                      |
| `/foo`              | A static path.                      |
| `/foo/(.*?)`        | A dynamic path.                     |
| `/cool/(.*?)/(.*?)` | A dynamic path with two parameters. |

#### Accessing Parameters

When your component is rendered, the `route` object will be passed in as a prop. You can then access the parameter(s) of a route using the `route.params` property:

```svelte
<script lang="ts">
  import type { Route } from "@mateothegreat/svelte5-router";

  let { route }: { route: Route } = $props();
</script>

<pre>{JSON.stringify(route.params, null, 2)}</pre>
```

If you were to route to `/cool/bar/baz`, this will result in the following output:

```json
[
  "bar",
  "baz"
]
```

## Example

```svelte
<script lang="ts">
  import type { Route } from "@mateothegreat/svelte5-router";
  import { route, Router } from "@mateothegreat/svelte5-router";
  ...

  const routes: Route<any>[] = [
    {
      path: "/",
      component: Homepage
    },
    {
      path: "about",
      component: About
    },
    {
      path: "settings",
      component: Settings
    }
  ];
</script>

<div class="flex gap-2">
  <a use:route href="/">Home</a>
  <a use:route href="/about">About</a>
  <a use:route href="/settings">Settings</a>
</div>

<Router base="/" {routes} />
</div>
```

> For a real world example, check out the [test app](./test/app/src/app.svelte).
