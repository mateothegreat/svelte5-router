<script lang="ts">
  import { goto, route, Router } from "@mateothegreat/svelte5-router";
  import { getLoggedIn, setLoggedIn } from "./account-state.svelte";
  import { authGuard } from "./auth-guard";
  import BankAccount from "./bank-account.svelte";
  import Denied from "./denied.svelte";
  import Login from "./login.svelte";
  import Logout from "./logout.svelte";
</script>

{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-gray-400 p-4">
    Some default stuff here.. <br />
    Click login!
  </div>
{/snippet}

<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <p class="rounded-sm bg-slate-900 p-2 text-center text-xs text-green-500">/protected</p>
  <div class="flex gap-2 rounded-sm bg-black p-4">
    Links:
    {#if !getLoggedIn()}
      <a
        use:route
        href="/protected/login"
        class="rounded-sm bg-green-500 px-2">
        Login
      </a>
      <a
        use:route
        href="/protected/bankaccount"
        class="rounded-sm bg-red-500 px-2">
        View My Bank Account (will fail)
      </a>
    {/if}
    {#if getLoggedIn()}
      <a
        use:route
        href="/protected/logout"
        class="rounded-sm bg-red-500 px-2">
        Logout
      </a>
    {/if}
  </div>
  <div class="rounded-sm bg-black p-4 shadow-xl">
    <Router
      basePath="/protected"
      routes={[
        {
          component: snippet,
          pre: () => {
            console.log("pre hook #1 fired for route");
          },
          post: () => {
            if (getLoggedIn()) {
              console.log("redirecting to bankaccount");
              goto("/protected/bankaccount");
            }
          }
        },
        {
          path: "/login",
          component: Login
        },
        {
          path: "/bankaccount",
          component: BankAccount,
          pre: authGuard
        },
        {
          path: "/logout",
          component: Logout,
          pre: () => {
            localStorage.removeItem("token");
          },
          post: () => {
            setLoggedIn(false);
            goto("/protected");
          }
        },
        {
          path: "/denied",
          component: Denied
        }
      ]} />
  </div>
</div>
