# Helpers

There are a few helpers that are available to you when using the router.

## `goto(path: string, queryParams?: Record<string, string>)`

Navigates to the given path by calling `goto("/path")`.

Example:

```ts
import { goto } from "@mateothegreat/svelte5-router";

goto("/foo", { bar: "baz" });
```

This will navigate to `/foo?bar=baz`.

## `pop(delta?: number)`

Navigates backwards in the browser history N pages.

Example:

```ts
import { pop } from "@mateothegreat/svelte5-router";

pop(); // Navigate back 1 page
pop(2); // Navigate back 2 pages
```

## `query(key: string): string | null`

Returns the value of the query parameter for the given key or null if the key does not exist.

## The `QueryString` class

A helper class for working with the query string.

> Check it out at [src/lib/query.svelte.ts](../src/lib/query.svelte.ts) and start using it now!

Basic usage:

```ts
import { QueryString } from "@mateothegreat/svelte5-router";

const query = new QueryString();

query.get("foo", "bar"); // "bar"
query.set("baz", "qux");
query.toString(); // "foo=bar&baz=qux"
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
