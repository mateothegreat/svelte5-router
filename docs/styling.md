# Routing Styling

You can have the router apply a class to the active route by setting the `active.class` option
when configuring your routes.

As the routes change, the router will apply the class to the active route while removing it from the previous active route(s).

## Configuration

This property can be a string or an array of strings:

> [!NOTE]
> This is a convenience feature and is not required. You can apply the class to the active route manually in your component.
>
> See <https://docs.router.svelte.spa/classes/RouteOptions.html> for more information.

Using a string:

```ts
export const myDefaultRouteConfig = {
  active: {
    class: "bg-yellow-500"
  }
};
```

Using an array of strings:

```ts
export const myDefaultRouteConfig = {
  active: {
    class: [
      "bg-yellow-500",
      "underline"
    ]
  }
};
```

## Usage

With our common configuration declared we can use it in our routes:

Import the common configuration:

```ts
<script lang="ts">
  import { myDefaultRouteConfig } from "./lib/common-stuff";
</script>
```

### Using `use:route`

```svelte
<a
  use:route={myDefaultRouteConfig}
  href="/props"
  class="py-1 hover:bg-blue-800 rounded bg-blue-600 px-3">
  /props
</a>
```

### Using `use:active`

You can also be more prescriptive and pass in the active class as an object.

> [!NOTE]
> This is functionally equivalent to using `use:route` with the same configuration.
> It is just a convenience method for when you don't need to pass in any other options.

```svelte
<a
  use:route
  use:active={{ active: { class: "bg-pink-500" } }}
  href="/baz"
  class="py-1 hover:bg-blue-800 rounded bg-blue-600 px-3">
  Click Me
</a>
```

Here we used two actions:

- `use:route`
  - This is the default action and is used to apply the active class to the active route.
- `use:active`
  - This is a convenience action that is used to apply the active class to the active route.
