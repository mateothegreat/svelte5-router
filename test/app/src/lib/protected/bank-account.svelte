<script>
  import { route } from "@mateothegreat/svelte5-router";
</script>

<div class="mt-4 flex flex-col items-center justify-center gap-2 rounded bg-pink-500 p-4">
  <p class="text-lg font-semibold">Bank Account Balance</p>
  <p class="text-sm">Your current balance is: <span class="font-bold">$10,000,000.00</span></p>
</div>

<a use:route href="/logout">Logout</a>
