<script lang="ts">
  import RouteWrapper from "$lib/components/routes/route-wrapper.svelte";
  import { myDefaultRouterConfig } from "$lib/default-route-config";
  import { goto, Router, RouterInstance } from "@mateothegreat/svelte5-router";
  import { ArrowRight, Building2, Shield, Wallet } from "lucide-svelte";
  import { client } from "../account-state.svelte";
  import { authGuardSlow } from "./auth-guard-slow";
  import Balance from "./balance.svelte";
  import Home from "./home.svelte";

  let router: RouterInstance = $state();
  let { route } = $props();
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
  name="/protected/manage-account"
  {route}
  end={true}
  title={{
    file: "src/routes/protected/manage-account/manage-account.svelte",
    content: "This router demonstrates how you can restrict access to routes based on the user's authentication state."
  }}
  links={[
    {
      href: "/protected/manage-account",
      label: "default path",
      options: {
        active: {
          absolute: true
        }
      }
    },
    {
      href: "/protected/manage-account/balance",
      label: "/protected/manage-account/balance"
    },
    {
      href: "/protected/manage-account/logout",
      label: "/protected/manage-account/logout"
    }
  ]}>
  <Router
    id="manage-account-router"
    basePath="/protected/manage-account"
    bind:instance={router}
    routes={[
      // This route is optional, it's for demonstration purposes.
      // It's used to redirect to the balance page when the user
      // navigates to the manage-account route (the default path):
      {
        component: Home
      },
      // {
      //   hooks: {
      //     pre: () => {
      //       goto("/protected/manage-account/balance");
      //     }
      //   }
      // },
      {
        path: "/balance",
        component: Balance,
        hooks: {
          pre: authGuardSlow
        }
      },
      {
        path: "/logout",
        hooks: {
          pre: () => {
            client.loggedIn = false;
            setTimeout(() => {
              goto("/protected/login");
            }, 1000);
          }
        }
      }
    ]}
    {...myDefaultRouterConfig} />
</RouteWrapper>
