# Routing Usage

We provide an array of `RouteConfig` objects to the `Router` component.

Each `RouteConfig` object describes a route and its associated component.

> [!NOTE]
> If you are using the same component for multiple routes, you must add the `renavigation` prop to the

## Pattern Matching

You can simply use static paths like `/foo` or dynamic paths like `/foo/(.*?)` with regex.

Example patterns:

| Pattern                                        | Description                                             |
| ---------------------------------------------- | ------------------------------------------------------- |
| `/`                                            | The root path.                                          |
| `/foo`                                         | A static path.                                          |
| `/foo/(.*?)`                                   | A dynamic path.                                         |
| `/cool/(.*?)/(.*?)`                            | A dynamic path with two parameters.                     |
| `(?<param1>.*)`                                | A dynamic path with a named parameter.                  |
| `^/users/(?<id>[a-z0-9]{25})(?:/(?<tab>.*))?$` | A dynamic path with a named parameter and optional tab. |

> When using named parameters, you can access them using the `$props()` function.
>
> For example, if the route is `/users/123/settings`, then `$props()` will be `{ id: "123", tab: "settings" }`.

## Parameter Extraction

Parameters that are capable of being parsed from the path are passed to the component through the `route` prop:

```svelte
<script>
  let { route } = $props();
</script>
```

When using named parameters such as `(?<id>[a-z0-9]{25})`, the parameter value will be passed through the `route` prop as an object:

```ts
const routes: RouteConfig[] = [
  {
    path: "/users/(?<id>[a-z0-9]{25})",
    component: User
  }
];
```

and can be accessed like this:

```svelte
<script>
  const userId = route.result.path.params.id;
</script>
```

For the full shape of `RouteResult` see the [API Reference](https://github.com/mateothegreat/svelte5-router/blob/main/src/lib/route.svelte.ts#L24).

## Examples

### Basic

The following example demonstrates a basic route configuration with two routes:

```ts
const routes: RouteConfig[] = [
  {
    // Notice that we don't need to specify the path.
    // The router will use this route as the default route when "/" is visited.
    component: Home
  },
  {
    path: "/about",
    component: About
  }
];
```

Passing the routes to the `<Router />` component:

```svelte
<Router {routes} />
```

## Full Example

The following example demonstrates a more complex route configuration with multiple routes and hooks:

```ts
const routes: RouteConfig[] = [
  // Example of a route that redirects to the home route:
  {
    path: "",
    hooks: {
      pre: () => {
        goto("/home");
      }
    }
  },
  {
    // Here we use a regex to match the home route.
    // This is useful if you want to match a route that has a dynamic path.
    // The "?:" is used to group the regex without capturing the match:
    path: /(?:^$|home)/,
    component: Home,
    // Use hooks to perform actions before and after the route is resolved:
    hooks: {
      pre: async (route: RouteResult): Promise<boolean> => {
        console.log("pre hook #1 fired for route");
        return true; // Return true to continue down the route evaluation path.
      },
      // Hooks can also be an array of functions (async too):
      post: [
        // This is a post hook that will be executed after the route is resolved:
        (route: RouteResult): boolean => {
          console.log("post hook #1 fired for route");
          return true; // Return true to continue down the route evaluation path.
        },
        // This is an async post hook that will be executed after the route is resolved:
        async (route: RouteResult): Promise<boolean> => {
          console.log("post hook #2 (async) fired for route");
          return true; // Return true to continue down the route evaluation path.
        }
      ]
    }
  },
  {
    path: "nested",
    component: Nested
  },
  {
    path: "async",
    // Routes can also be async functions that return a promise.
    // This is useful if you want to load a component asynchronously aka "lazy loading":
    component: async () => import("./lib/async/async.svelte")
  },
  {
    path: "delayed",
    component: Delayed,
    hooks: {
      pre: async (route: RouteResult): Promise<boolean> => {
        // Simulate a network delay by returning a promise that resolves after a second:
        return new Promise((resolve) =>
          setTimeout(() => {
            resolve(true);
          }, 1000)
        );
      }
    }
  },
  {
    path: "props",
    component: Props
  },
  {
    path: "protected",
    component: Protected
  },
  {
    path: "query-redirect",
    component: QueryRedirect
  },
  {
    path: "context",
    component: Context
  }
];

// This is a global pre hook that can be applied to all routes.
// Here you could check if the user is logged in or perform some other
// authentication checks:
const globalAuthGuardHook = async (route: RouteResult): Promise<boolean> => {
  console.warn("globalAuthGuardHook", route);
  // Return true so that the route can continue down its evaluation path.
  return true;
};
```

## Renavigation

If you are using the same component for multiple routes, the `renavigation` prop is required to be set to `true` on the `<Router />` component.

> [!NOTE]
> This is now the default behavior. If you want to disable it, you can set the `renavigation` prop to `false` explicitly.

For example, if you have the following routes:

```typescript
<script>
  import Router, { type RouteConfig } from "@mateothegreat/svelte5-router/router.svelte";

  const routes: RouteConfig[] = [
    {
      path: "/foo",
      component: SameComponent
    },
    {
      path: "/bar",
      component: SameComponent
    }
  ];
</script>
```

And you want to disable it, you can do the following by setting the `renavigation` prop to `false`:

```svelte
<Router
  id="renavigation-router"
  basePath="/renavigation"
  renavigation={false}
  {routes} />
```

This will prevent the same component to be used for multiple routes effectively being re-rendered when the route changes.
