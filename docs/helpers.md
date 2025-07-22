# Helpers

There are a few helpers that are available to you when using the router.

## `goto(path: string, queryParams?: Record<string, string>)`

Navigates to the given path by calling `goto("/path")`.

Example:

```ts
goto("/foo", { bar: "baz" });
```

This will navigate to `/foo?bar=baz`.

## `query(key: string): string | null`

Returns the value of the query parameter for the given key or null if the key does not exist.

## The `QueryString` class

A helper class for working with the query string.

> Check it out at [src/lib/query.svelte.ts](../src/lib/query.svelte.ts).
> or import it with:
>
> ```ts
> import { QueryString } from "@mateothegreat/svelte5-router";
> ```
>
> and start using it now!

Basic usage:

```ts
import { QueryString } from "@mateothegreat/svelte5-router";

const query = new QueryString();

query.get("foo", "bar"); // "bar"
query.set("baz", "qux");
query.toString();        // "foo=bar&baz=qux"
```

Using it with navigation:

```ts
import { QueryString } from "@mateothegreat/svelte5-router";

const query = new QueryString();

// ...
query.set("foo", "baz");
query.set("baz", "qux");
// ...

query.goto("/test"); // Navigates to "/test?foo=baz&baz=qux"
```

You can also pass a query object to the `goto` method:

```ts
goto("/test", { foo: "baz" }); // Navigates to "/test?foo=baz"
```

## `pop()`

Easily go back to previous page

```svelte
<script>
import { pop } from "@mateothegreat/svelte5-router";
</script>

<button onclick={pop}> Go back </button>
```

Or perform an action first

```svelte
<script>
import { pop } from "@mateothegreat/svelte5-router";

const save = async () => {
  const result = await database.write("some data") // replace this with real code
  if (result.success) {
    await pop() // Return to previous page after data is saved
  }
}
</script>

<button onclick={save}>
  Save and return
</button>
```
