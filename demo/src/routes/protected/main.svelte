<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { myDefaultRouterConfig } from "$lib/default-route-config";
  import { goto, registry, Router, RouterInstance } from "@mateothegreat/svelte5-router";
  import { ArrowRight, Building2, Loader2, Shield, Wallet } from "lucide-svelte";
  import Denied from "./denied.svelte";
  import Login from "./login.svelte";
  import { authGuardFast } from "./manage-account/auth-guard-fast";

  let router: RouterInstance = $state();
  let { route } = $props();

  /**
   * This is a helper state variable that can be used to determine if the
   * current route is the same as the route that is being rendered so
   * that we can show a badge to indicate this is the last router in the
   * nested routing hierarchy.
   */
  let end = $state(true);

  $effect(() => {
    end =
      router.current?.result.path.condition === "default-match" ||
      location.pathname === "/protected/login" ||
      location.pathname === "/protected/denied";
  });
</script>

{#snippet snippet()}
  <div class="rounded-md border-4 border-slate-400 bg-gradient-to-b from-blue-100 to-blue-300">
    <div class="mx-auto max-w-6xl px-4 py-12">
      <div class="mb-16 text-center">
        <h1 class="mb-6 text-4xl font-bold text-blue-500 md:text-6xl">Welcome to SPA Router Bank!</h1>
        <p class="mb-8 text-xl text-black">Your trusted partner in routing.</p>
        <button
          on:click={() => goto("/protected/login")}
          class="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
          Login <ArrowRight size={20} />
        </button>
      </div>
      <div class="mb-16 grid gap-8 md:grid-cols-3">
        <div class="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
          <Shield class="mb-4 h-12 w-12 text-blue-600" />
          <h3 class="mb-2 text-xl font-semibold text-gray-800">Secure Banking</h3>
          <p class="text-gray-600">State-of-the-art security measures to protect your financial data</p>
        </div>
        <div class="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
          <Building2 class="mb-4 h-12 w-12 text-blue-600" />
          <h3 class="mb-2 text-xl font-semibold text-gray-800">Business Solutions</h3>
          <p class="text-gray-600">Comprehensive banking solutions for businesses of all sizes</p>
        </div>
        <div class="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
          <Wallet class="mb-4 h-12 w-12 text-blue-600" />
          <h3 class="mb-2 text-xl font-semibold text-gray-800">Personal Banking</h3>
          <p class="text-gray-600">Tailored financial services for your personal needs</p>
        </div>
      </div>
    </div>
  </div>
{/snippet}

<RouteWrapper
  {router}
  name="/protected"
  {route}
  {end}
  title={{
    file: "src/routes/protected/main.svelte",
    content: "Demo to show how you can use hooks to control the navigation of your app to control authentication, etc."
  }}
  links={[
    {
      href: "/protected",
      label: "default path",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/protected/login",
      label: "/protected/login"
    },
    {
      href: "/protected/manage-account",
      label: "/protected/manage-account"
    },
    {
      href: "/protected/denied",
      label: "/protected/denied"
    }
  ]}>
  <Router
    id="protected-router"
    basePath="/protected"
    bind:instance={router}
    routes={[
      {
        component: snippet
      },
      {
        path: "login",
        component: Login
      },
      {
        path: "manage-account",
        component: async () => import("./manage-account/manage-account.svelte"),
        hooks: {
          pre: authGuardFast
        }
      },
      {
        path: "denied",
        component: Denied
      }
    ]}
    {...myDefaultRouterConfig} />
</RouteWrapper>

{#if registry.get("manage-account-router")?.navigating}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="flex flex-col items-center gap-4 rounded-md border-2 border-green-400 bg-black/70 px-20 py-6">
      <Loader2 class="h-12 w-12 text-green-500  animate-spin" />
      <div class="text-slate-300 font-bold">Doing some work...</div>
      <div class="text-slate-400 w-96 text-center">
        We've added some pre and post hooks to the manage-account router to simulate doing some work.
      </div>
    </div>
  </div>
{/if}
