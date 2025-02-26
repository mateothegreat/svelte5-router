# Routing Hooks

 | Order | Event  | Scope       | Description                                |
 | ----- | ------ | ----------- | ------------------------------------------ |
 | 1.    | `pre`  | `<Router/>` | Always runs *before* a route is attempted. |
 | 2.    | `pre`  | `Route`     | Runs *before* the route is rendered.       |
 | 3.    | `post` | `Route`     | Runs *after* the route is rendered.        |
 | 4.    | `post` | `<Router/>` | Always runs *after* a route is rendered.   |

```ts
import { goto, type Route } from "@mateothegreat/svelte5-router";

export const authGuard = async (route: Route): Promise<boolean> => {
  console.log("simulating some login/auth check...");
  // Crude example of checking if the user is logged in. A more
  // sophisticated example would use a real authentication system
  // and a server-side API.
  if (!localStorage.getItem("token")) {
    console.warn("redirecting to denied");
    goto("/protected/denied");
    return false;
  }
  return true;
}

const globalPostHook1 = (route: Route): boolean => {
  console.warn("globalPostHook1", route);
  // Return true so that the route can continue down its evaluation path.
  return true;
};

const globalPostHook2 = async (route: Route): Promise<boolean> => {
  console.warn("globalPostHook2", route);
  // Return true so that the route can continue down its evaluation path.
  return true;
};
```

You can pass an array or single method for the `pre` and `post` hooks and you can
also mix and match asynchronous and synchronous hooks.

```html
<Router
  {routes}
  hooks={{
    pre: authGuard,
    post: [
      globalPostHook1,
      globalPostHook2
    ]
  }}
/>
```
