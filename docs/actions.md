# Actions

The Svelte router provides powerful actions that can be used to enhance your routing experience. These actions are designed to be used with anchor (`<a>`) elements to handle navigation and manage active states.

## Available Actions

| Action | Description |
|--------|-------------|
| [`route`](#route) | Manages both navigation and active states of links. |
| [`active`](#active) | Handles active state management for styling links. |  

## Examples

### Basic Navigation Link

```svelte
<a href="/home" use:route>Home</a>
```

### Active State with Multiple Classes

```svelte
<a 
  href="/profile" 
  use:route={{
    default: { class: ['text-gray-600', 'hover:text-gray-900'] },
    active: { class: ['text-blue-600', 'font-bold'] }
  }}
>
  Profile
</a>
```

### Exact Path Matching

```svelte
<a 
  href="/settings" 
  use:route={{
    active: {
      class: 'active-link',
      absolute: true // Only active when path exactly matches /settings
    }
  }}
>
  Settings
</a>
```

### Query String Sensitive Navigation

```svelte
<a 
  href="/search?type=users" 
  use:route={{
    active: {
      class: 'active-search',
      querystring: true // Only active when querystring matches exactly
    }
  }}
>
  User Search
</a>
```

### Notes

- The `route` action automatically prevents default link behavior and handles navigation through the History API.
- When using `active`, you'll need to handle navigation separately if needed.
- Classes are applied dynamically based on the current route state.
- The `absolute` option is useful for preventing parent routes from being marked as active when child routes are active.
- The `querystring` option allows for precise matching including query parameters.

---

## `route`

The `route` action is the primary action for handling routing in your application. It manages both navigation and active states of links.

```svelte
<a href="/dashboard" use:route>Dashboard</a>
```

The `route` action accepts an options object with the following configuration:

```typescript
{
  default?: {
    absolute?: boolean;
    querystring?: boolean;
    class?: string | string[];
  },
  active?: {
    absolute?: boolean;
    querystring?: boolean;
    class?: string | string[];
  },
  loading?: {
    absolute?: boolean;
    querystring?: boolean;
    class?: string | string[];
  },
  disabled?: {
    absolute?: boolean;
    querystring?: boolean;
    class?: string | string[];
  }
}
```

- `default`: Options applied when the route is inactive.
- `active`: Options applied when the route is active.
- `loading`: Options applied when the route is loading.
- `disabled`: Options applied when the route is disabled.

Each state accepts the following properties:

- `absolute`: When `true`, effects only apply on exact path matches.
- `querystring`: When `true`, effects only apply when querystring exactly matches.
- `class`: CSS class(es) to apply when the state is active.

Example with options:

```svelte
<a 
  href="/dashboard" 
  use:route={{
    default: { class: 'text-gray-600' },
    active: { 
      class: 'text-blue-600 font-bold',
      absolute: true 
    }
  }}
>
  Dashboard
</a>
```

## `active`

The `active` action is a simplified version of `route` that only handles active state management without handling navigation events. This is useful when you want to style links based on the current route but handle navigation differently.

```svelte
<a href="/dashboard" use:active>Dashboard</a>
```

The `active` action accepts a subset of the route options, focusing only on the active state configuration:

```typescript
{
  active?: {
    absolute?: boolean;
    querystring?: boolean;
    class?: string | string[];
  }
}
```

Example with options:

```svelte
<a 
  href="/dashboard" 
  use:active={{
    active: {
      class: ['text-blue-600', 'font-bold'],
      absolute: true,
      querystring: true
    }
  }}
>
  Dashboard
</a>
```
