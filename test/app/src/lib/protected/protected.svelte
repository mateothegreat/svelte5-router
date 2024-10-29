<script lang="ts">
  import { Router } from "@mateothegreat/svelte5-router";
  import BankAccount from "./bank-account.svelte";
</script>

<div class="flex flex-col items-center justify-center gap-2 rounded bg-pink-500 p-4">
  <p class="text-lg font-semibold">You've entered a protected Router!</p>
  <p class="text-sm">All children of this Router instance will be protected.</p>
</div>

<Router
  routes={[
    {
      path: "",
      component: BankAccount
    }
  ]} />
