# Routing Usage

## Example

```ts
const routes: Route[] = [
  // Example of a route that redirects to the home route:
  {
    path: "",
    hooks: {
      pre: () => {
        goto("/home");
      }
    }
  },
  {
    // Here we use a regex to match the home route.
    // This is useful if you want to match a route that has a dynamic path.
    // The "?:" is used to group the regex without capturing the match:
    path: /(?:^$|home)/,
    component: Home,
    // Use hooks to perform actions before and after the route is resolved:
    hooks: {
      pre: async (route: Route): Promise<boolean> => {
        console.log("pre hook #1 fired for route");
        return true; // Return true to continue down the route evaluation path.
      },
      // Hooks can also be an array of functions (async too):
      post: [
        // This is a post hook that will be executed after the route is resolved:
        (route: Route): boolean => {
          console.log("post hook #1 fired for route");
          return true; // Return true to continue down the route evaluation path.
        },
        // This is an async post hook that will be executed after the route is resolved:
        async (route: Route): Promise<boolean> => {
          console.log("post hook #2 (async) fired for route");
          return true; // Return true to continue down the route evaluation path.
        }
      ]
    }
  },
  {
    path: "nested",
    component: Nested
  },
  {
    path: "async",
    // Routes can also be async functions that return a promise.
    // This is useful if you want to load a component asynchronously aka "lazy loading":
    component: async () => import("./lib/async/async.svelte")
  },
  {
    path: "delayed",
    component: Delayed,
    hooks: {
      pre: async (route: Route): Promise<boolean> => {
        // Simulate a network delay by returning a promise that resolves after a second:
        return new Promise((resolve) =>
          setTimeout(() => {
            resolve(true);
          }, 1000)
        );
      }
    }
  },
  {
    path: "props",
    component: Props
  },
  {
    path: "protected",
    component: Protected
  },
  {
    path: "query-redirect",
    component: QueryRedirect
  },
  {
    path: "context",
    component: Context
  }
];

// This is a global pre hook that can be applied to all routes.
// Here you could check if the user is logged in or perform some other
// authentication checks:
const globalAuthGuardHook = async (route: Route): Promise<boolean> => {
  console.warn("globalAuthGuardHook", route);
  // Return true so that the route can continue down its evaluation path.
  return true;
};
```
