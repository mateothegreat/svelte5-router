<script lang="ts">
  import type { Route } from "@mateothegreat/svelte5-router";
  import { goto, route, Router } from "@mateothegreat/svelte5-router";
  import A from "./lib/a/a.svelte";
  import Default from "./lib/default.svelte";
  import Params from "./lib/params/params.svelte";
  import Props from "./lib/props/props.svelte";
  import BankAccount from "./lib/protected/bank-account.svelte";
  import Login from "./lib/protected/login.svelte";
  import Protected from "./lib/protected/protected.svelte";

  const routes: Route[] = [
    {
      path: "",
      component: Default
    },
    {
      path: "a",
      component: A
    },
    {
      path: "props",
      component: Props,
      props: {
        myProp: {
          date: new Date(),
          name: "mateothegreat"
        }
      }
    },
    {
      path: "params",
      component: Params
    },
    {
      path: "logout",
      pre: (route: Route) => {
        localStorage.removeItem("token");
        return {
          path: "/",
          component: Default
        };
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

  const globalAuthGuardHook = (route: Route): Route => {
    // This is a global pre hook that will be applied to all routes.
    // Here you could check if the user is logged in or perform some other
    // authentication checks.
    // NOTE: This is a pre hook, so it can return a new route to redirect to.
    //
    // If you don't want to redirect the user, just return the same route:
    return route;
  };

  const globalLoggerPostHook = (route: Route): void => {
    console.log("post hook fired for route:", route);
  };
</script>

<div class="absolute flex h-full w-full flex-col items-center gap-4 bg-zinc-950 p-10">
  <h1 class="text-center text-sm font-semibold text-indigo-500">Svelte SPA Router Demo</h1>
  <div class="flex gap-2">
    <a use:route href="/" class="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-800">/</a>
    <a use:route href="/a" class="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-800">/a</a>
    <a use:route href="/props" class="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-800">/props</a>
    <a use:route href="/params" class="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-800">/params</a>
    <a use:route href="/protected" class="rounded bg-pink-600 px-3 py-1 text-xs text-white hover:bg-blue-800"
      >/protected</a>
    <button on:click={() => goto("/a")} class="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-800">
      Call the <span class="rounded bg-black px-2 py-0.5 text-green-500">goto("/a");</span> method
    </button>
  </div>
  <div class="flex flex-col gap-4 rounded-lg bg-black p-4 shadow-xl">
    <p class="text-center text-xs text-zinc-500">app.svelte</p>
    <Router {routes} pre={globalAuthGuardHook} post={globalLoggerPostHook} />
  </div>
</div>
