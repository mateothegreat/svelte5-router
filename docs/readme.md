# Svelte 5 SPA Router 🚀 🔥

![logo](https://raw.githubusercontent.com/mateothegreat/svelte5-router/refs/heads/dev/docs/assets/logo-1000px.png)

<img src="https://raw.githubusercontent.com/mateothegreat/svelte5-router/refs/heads/dev/docs/assets/coverage.svg?sanitize=true" />

An SPA router for Svelte that allows you to divide & conquer your app with nested routers, snippets, and more.

> [!NOTE]
> Live demo: <https://demo.router.svelte.spa>
>
> API documentation: <https://docs.router.svelte.spa>

## Features

- Built for Svelte 5 🚀!
- Divide & conquer - use nested routers all over the place.
- Use components, snippets, or both 🔥!
- Use regex paths (e.g. `/foo/(.*?)/bar`) and/or named parameters together.
- Use async routes simply with `component: async () => import("./my-component.svelte")`.
- Add hooks to your routes to control the navigation flow 🔧.
- Automagic styling of your anchor tags 💄.
- Helper methods 🛠️ to make your life easier.
- Debugging tools included 🔍.

## Installation

```bash
npm install @mateothegreat/svelte5-router
```

## Table of Contents

- [Getting Started](./getting-started.md)
- [Routing](./routing.md)
- [Hooks](./hooks.md)
- [Actions](./actions.md)
- [Helper Methods](./helpers.md)
- [Default Status Mapping](./statuses.md)
- [The Router Registry](./registry.md)
- [Route Styling](./styling.md)
- [Accessing Props](./props.md)
- [Debugging](./debugging.md)
- [Diagrams](./diagrams.md)

> [!NOTE]
> Include [llms.txt](../llms.txt) in your LLM prompt to get add rich context to your tasks by referencing `https://raw.githubusercontent.com/mateothegreat/svelte5-router/refs/heads/main/llms.txt`.

## How it works

When the browser URL changes, the router instance is triggered. It then registers the route in the registry, evaluates the route matching, and resolves the route.

<div align="center">

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#2563eb',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#1e40af',
    'lineColor': '#64748b',
    'secondaryColor': '#4ade80',
    'tertiaryColor': '#f472b6'
  }
}}%%
flowchart TD
    A[Route Evaluation Start] --> B{Check Path Type}
    B -->|String| C[Direct Match]
    B -->|RegExp| D[Pattern Match]
    B -->|Function| E[Custom Match]
    
    C --> F{Path Matches?}
    D --> F
    E --> F
    
    F -->|Yes| G[Check Query Parameters]
    F -->|No| H[Try Next Route]
    
    G --> I{Query Matches?}
    I -->|Yes| J[Create Route Result]
    I -->|No| H
    
    H --> K{More Routes?}
    K -->|Yes| B
    K -->|No| L[Use Default Route]
    
    J --> M[Execute Pre Hooks]
    L --> M
    
    style A fill:#3b82f6,stroke:#1d4ed8
    style B fill:#4ade80,stroke:#16a34a
    style F fill:#f472b6,stroke:#db2777
    style I fill:#f472b6,stroke:#db2777
    style J fill:#4ade80,stroke:#16a34a
    style M fill:#3b82f6,stroke:#1d4ed8 
```

</div>

> [!NOTE]
> You can view more diagrams in [diagrams.md](./diagrams.md).
