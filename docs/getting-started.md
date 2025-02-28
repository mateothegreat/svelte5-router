# Getting Started

## Installation

```bash
npm install @mateothegreat/svelte5-router
```

## Usage

In your `app.svelte` file, you can use the `Router` component to render your routes:

```svelte
<script lang="ts">
  import { Router, type Route } from "@mateothegreat/svelte5-router";

  const routes: Route[] = [
    {
      component: Home
    }
    {
      path: "products",
      component: Products
    },
    {
      path: "settings",
      component: Settings
    }
  ];
</script>

<Router {routes} />
```

When you navigate to the root route, the `Home` component will be rendered.

When you navigate to the `/products` route, the `Products` component will be rendered.

When you navigate to the `/settings` route, the `Settings` component will be rendered.
