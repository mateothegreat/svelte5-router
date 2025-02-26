# Passing Props

You can pass props to a route by using the `props` property on any route.

These props will be passed to the component via `$props()`:

```ts
const routes: Route[] = [
  {
    path: /\/(?<child>.*)/,
    component: DisplayParams,
    props: {
      randomId: Math.random().toString(36).substring(2, 15),
      someUserStuff: {
        username: "mateothegreat",
        userAgent: navigator.userAgent
      }
    }
  }
];
```

Then, in your component, you can access the prop like this:

```svelte
<script lang="ts">
  let { route } = $props();
</script>

<pre>{JSON.stringify(route, null, 2)}</pre>
```

When you navigate to `/props/bar?someQueryParam=123`, the output will be:

```json
{
  "route": {
    "params": {
      "child": "bar"
    },
    "props": {
      "randomId": "y3pbfi1mgmg",
      "someUserStuff": {
        "username": "mateothegreat",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
      }
    },
    "query": {
      "someQueryParam": "123"
    },
    "name": "props-fancy-regex",
    "path": {
      "before": "/\\/(?<child>.*)/",
      "after": "/props/bar"
    }
  }
}
```
