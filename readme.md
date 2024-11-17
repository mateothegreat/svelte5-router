# Svelte Routing like a boss

![alt text](image.png)

An SPA router for Svelte that allows you to divide & conquer your app with nested routers, snippets, and more.

> Live demo: <https://svelte5-router.vercel.app>

## Features

- Supports Svelte 5, just one rune baby 🚀!
- Divide & conquer - use nested routers all over the place.
- Use components, snippets, or both!
- Use regex paths (e.g. `/foo/(.*?)/bar`) and/or named parameters together 🔥.
- Use async routes simply with `component: async () => import("./my-component.svelte")`.
- Base path support.

## Installation

```bash
npm install @mateothegreat/svelte5-router
```

## Usage

All you need to do is define your routes and then use the `Router` component with the `routes` array.

To make a link, use the `route` directive with the `href` attribute such as `<a use:route href="/foo">foo</a>`.

## Base Paths

In some cases you may not be able to use the base path of your app as the root path. For example, if you are using a nested router, you may want to use a base path of `/foo` instead of `/`.

Simply pass the `basePath` prop to the `Router` component and it will handle the rest:

> No need to update your routes either, it will support both `/mybasepath/foo` and `/foo` just fine.

```svelte
<Router basePath="/mybasepath" {routes} />
```

### Methods

#### `goto(path: string)`

Navigates to the given path.

#### `query(key: string): string | null`

Returns the value of the query parameter for the given key or null if the key does not exist.

#### The `QueryString` class

A helper class for working with the query string.

> Check it out at [src/lib/query.svelte.ts](./src/lib/query.svelte.ts).
> or import it with:
>
> ```ts
> import { QueryString } from "@mateothegreat/svelte5-router";
> ```
>
> and start using it now!

##### Example Usage

Basic usage:

```ts
import { QueryString } from "@mateothegreat/svelte5-router";

const query = new QueryString();

query.get("foo", "bar"); // "bar"
query.set("foo", "baz");
query.toString();        // "foo=baz"
```

Using it with navigation:

```ts
import { QueryString } from "@mateothegreat/svelte5-router";

const query = new QueryString();

// ...
query.set("foo", "baz");
// ...

query.goto("/test"); // Navigates to "/test?foo=baz"
```

### Routes

You can simply use static paths like `/foo` or dynamic paths like `/foo/(.*?)` with regex.

Example patterns:

| Pattern             | Description                         |
| ------------------- | ----------------------------------- |
| `/`                 | The root path.                      |
| `/foo`              | A static path.                      |
| `/foo/(.*?)`        | A dynamic path.                     |
| `/cool/(.*?)/(.*?)` | A dynamic path with two parameters. |

For transparency, here's the type definition for a route:

> Only `path` is required at a minimum with either pre/post hooks or a component/snippet.

```ts
export interface Route {
  path: RegExp | string;
  component?: Component<any> | Snippet;
  props?: Record<string, any>;
  pre?: PreHooks;
  post?: PostHooks;
}
```

Hooks are typed as follows:

> As you can see, you can pass an array of hooks or a single hook as a promise or not:

```ts
export type PreHooks = ((route: Route) => Route)[] | ((route: Route) => Promise<Route>)[] | ((route: Route) => Route) | ((route: Route) => Promise<Route>);
export type PostHooks = ((route: Route) => void)[] | ((route: Route) => Promise<void>)[] | ((route: Route) => void) | ((route: Route) => Promise<void>);
```

#### Async Routes

Use async routes simply with `component: async () => import("./my-component.svelte")`.

```svelte
const routes: Route[] = [
  {
    path: "simple",
    component: Simple
  },
  {
    path: "async",
    component: async () => import("./lib/async/async.svelte")
  }
];
```

#### Using Components & Snippets

For the quickest and easiest routes, you can use components:

```svelte
const routes: Route[] = [
  {
    path: "/foo",
    component: Foo
  }
];
```

For more complex routing needs, you can use snippets:

```svelte
<script lang="ts">
  import { route, Router, type Route } from "@mateothegreat/svelte5-router";
  import All from "./all.svelte";

  const routes: Route[] = [
    {
      path: "/snippetsarecool",
      component: mySnippet
    }
  ];
</script>

{#snippet mySnippet()}
  <div class="flex flex-col gap-3 bg-green-400 p-4">
    I'm a snippet!<br />
    Click on a link above to see the params..
  </div>
{/snippet}
```

#### Accessing Parameters

When your component is rendered, the `route` object will be passed in as a prop. You can then access the parameter(s) of a route using the `route.params` property:

```svelte
<script lang="ts">
  import type { Route } from "@mateothegreat/svelte5-router";

  let { params }: { params: string[] } = $props();
</script>

<pre>{JSON.stringify(params, null, 2)}</pre>
```

If you were to route to `/cool/bar/baz`, this will result in the following output:

```json
[
  "bar",
  "baz"
]
```

#### Passing Props

You can pass props to a route by using the `props` property on any route. These props will be passed to the component as a prop:

```svelte
const routes: Route[] = [
  {
    path: "/user/profile",
    component: UserProfile,
    props: {
      myProps: {
        date: new Date(),
        name: "mateothegreat"
      }
    }
  }
];
```

Then, in your component, you can access the prop like this:

```svelte
<script lang="ts">
  let { myProps } = $props();
</script>

<pre>{JSON.stringify(myProps, null, 2)}</pre>
```

### `pre` and `post` hooks

Use `pre` and `post` hooks to run before and after a route is rendered to do things like authentication, logging, etc.

#### Hook Syntax

| Syntax                            | Location    | Description                                 |
| --------------------------------- | ----------- | ------------------------------------------- |
| `<Router pre={myHooks}>`          | `<Router/>` | Runs before **any** route is rendered.      |
| `<Router post={myHooks}>`         | `<Router/>` | Runs after **any** route is rendered.       |
| `{ path: "/", pre: () => {...}}`  | `Route`     | Runs before the specific route is rendered. |
| `{ path: "/", post: () => {...}}` | `Route`     | Runs after the specific route is rendered.  |

> You can pass an array or single method for the `pre` and `post` hooks.

```svelte
const routes: Route[] = [
  {
    path: "unprotected",
    component: Unprotected
    post: () => {
      console.log("post hook fired");
    }
  },
  {
    path: "protected",
    component: Protected,
    // Use a pre hook to simulate a protected route:
    pre: (route: Route) => {
      console.log("pre hook #1 fired for route:", route);
      // Crude example of checking if the user is logged in. A more
      // sophisticated example would use a real authentication system
      // and a server-side API.
      if (!localStorage.getItem("token")) {
        // By returning a new route, the user will be redirected to the
        // new route and then the post hook(s) will be executed:
        return {
          path: "/login",
          component: Login
        };
      } else {
        // By returning a new route, the user will be redirected to the
        // new route and then the post hook(s) will be executed:
        return {
          path: "/bankaccount",
          component: BankAccount
        };
      }
    },
    post: [
      (route: Route): void => {
        console.log("post hook #1 fired for route:", route);
      },
      (route: Route): void => {
        console.log("post hook #2 fired for route:", route);
      }
    ]
  }
];
```

### States

#### Navigation State

```svelte
<script lang="ts">
  import { Router } from "@mateothegreat/svelte5-router";

  const routes: Route[] = [
    {
      path: "",
      component: Homepage
    },
    {
      path: "about",
      component: About
    }
  ];

  let navigating: boolean; // This is $state<boolean>
</script>

<Router bind:navigating {routes} />

<span class="rounded border border-zinc-800 px-1 py-0.5 text-orange-500">
  {navigating ? "(true) navigating..." : "(false) idle"}
</span>
```

## Example

```svelte
<script lang="ts">
  import type { Route } from "@mateothegreat/svelte5-router";
  import { route, Router } from "@mateothegreat/svelte5-router";
  ...

  const routes: Route[] = [
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

## Deploying

To deploy to Vercel, add the following to your `vercel.json`:

```json
{
  "routes": [{ "src": "/[^.]+", "dest": "/", "status": 200 }]
}
```
