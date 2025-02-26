# Svelte Routing like a boss

![alt text](../../image.png)

An SPA router for Svelte that allows you to divide & conquer your app with nested routers, snippets, and more.

> [!NOTE]
> Live demo: <https://svelte5-router.vercel.app>
>
> API documentation: <https://mateothegreat.github.io/svelte5-router>.

## Features

- Built for Svelte 5 🚀!
- Divide & conquer - use nested routers all over the place.
- Use components, snippets, or both!
- Use regex paths (e.g. `/foo/(.*?)/bar`) and/or named parameters together 🔥.
- Use async routes simply with `component: async () => import("./my-component.svelte")`.
- Add hooks to your routes to control the navigation flow.
- Automagic styling of your anchor tags.
- Helper methods to make your life easier.
- Debugging tools to help you out.

## Installation

```bash
npm install @mateothegreat/svelte5-router
```

## Table of Contents

- [Getting Started](./getting-started.md)
- [Routing](./routing.md)
- [Hooks](./hooks.md)
- [Helper Methods](./helper-methods.md)
- [Default Status Mapping](./statuses.md)
- [The Router Registry](./registry.md)
- [Route Styling](./styling.md)
- [Accessing Props](./props.md)
- [Debugging](./debugging.md)
