# Routing Patterns

As your application grows, you'll likely need to use more complex routing patterns. This guide will cover the most common patterns and how to use them.
<p>The <abbr title="Hyper Text Markup Language">HTML</abbr> specification
is maintained by the <abbr title="World Wide Web Consortium">W3C</abbr>.</p>

asdf [^1]

<h1 class="style-me">header</h1>
<p data-toggle="modal">paragraph</p>

[<button>Click me</button>](https://www.google.com)

[[docs/readme]]asdf

## Table of Contents

- [Routing Patterns](#routing-patterns)
  - [Table of Contents](#table-of-contents)
  - [Default Route](#default-route)
  - [Single Path](#single-path)
  - [Nested Paths](#nested-paths)
  - [Parameter Extraction](#parameter-extraction)
  - [Named Parameters](#named-parameters)

## Default Route

This example demonstrates how to make a route be the default route under the following conditions:

Order of operations:

1. If the path is empty, the route will be matched otherwise evaluation will continue.
2. If no other route matches, the default route will be matched and evaluation will continue.
3. If [statuses](./statuses.md) is present at the `<Router />` component and `404` is set, this route will then be matched and evaluation will end.

Examples:

> [!NOTE]
> You can omit the `path` property to make the route the default route which is the
> same as `path: "/"` and `path: ""`.

```ts
const routes: RouteConfig[] = [
  {
    component: ComponentToRender 
  }
];
```

```ts
const routes: RouteConfig[] = [
  {
    path: "",
    component: ComponentToRender 
  }
];
```

```ts
const routes: RouteConfig[] = [
  {
    path: "/",
    component: ComponentToRender 
  }
];
```

## Single Path

This example will match any path that starts with `/path`.

Order of operations:

1. If the path matches exactly, the route will be matched otherwise evaluation will continue.
2. If [statuses](./statuses.md) is present at the `<Router />` component and `404` is set, this route will then be matched and evaluation will end.

Examples:

```ts
const routes: RouteConfig[] = [
  {
    path: "/path",
    component: ComponentToRender 
  }
];
```

## Nested Paths

This example will match any path that starts with `/path/path/path` and can be nested further.

> [!NOTE]
> This example has a demo available at <https://demo.router.svelte.spa/nested>!

Order of operations:

1. If the path matches exactly, the route will be matched otherwise evaluation will continue.
2. If [statuses](./statuses.md) is present at the `<Router />` component and `404` is set, this route will then be matched and evaluation will end.

Examples:

```ts
const routes: RouteConfig[] = [
  {
    path: "/path/path",
    component: ComponentToRender 
  }
];
```

```ts
const routes: RouteConfig[] = [
  {
    path: "/path/path/path",
    component: ComponentToRender 
  }
];
```

```ts
const routes: RouteConfig[] = [
  {
    path: "/path/path/path/path",
    component: ComponentToRender 
  }
];
```

## Parameter Extraction

Combine arbitrary paths and extractable parameters.

> [!NOTE]
> This example has a demo available at <https://demo.router.svelte.spa/paths-and-params>!

Order of operations:

1. If there are arbitrary paths, the route **must** contain all of them.
2. If there are parameters, the path **must** match the expression.
3. If [statuses](./statuses.md) is present at the `<Router />` component and `404` is set, this route will then be matched and evaluation will end.

Examples:

**Unnamed Parameters**:

```ts
const routes: RouteConfig[] = [
  {
    path: "/path/(.*?)/path/(.*?)",
    component: ComponentToRender 
  }
];
```

**Named Parameters**:

```ts
const routes: RouteConfig[] = [
  {
    path: "/path/(?<myParam>.*)/path/(?<myParam2>.*)",
    component: ComponentToRender 
  }
];
```

## Named Parameters

This example will match any path that starts with `/path/path/path/path` and can be nested further.

Order of operations:

1. If the path matches exactly, the route will be matched otherwise evaluation will continue.
2. If [statuses](./statuses.md) is present at the `<Router />` component and `404` is set, this route will then be matched and evaluation will end.

```ts
const routes: RouteConfig[] = [
  {
    path: "(?<myParam>.*)",
    component: ComponentToRender 
  }
];
```

```ts
const routes: RouteConfig[] = [
  {
    path: "/path/(?<myParam>.*)",
    component: ComponentToRender 
  }
];
```

```ts
const routes: RouteConfig[] = [
  {
    path: "/path/(?<myParam>.*)/path/(?<myParam2>.*)",
    component: ComponentToRender 
  }
];
```

a
[^1]: This is a footnote
b
