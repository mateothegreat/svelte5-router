<script lang="ts">
  import { goto } from "@mateothegreat/svelte5-router";
  import { setLoggedIn } from "./account-state.svelte";
</script>

<div class="mt-4 flex flex-col items-center justify-center gap-6 rounded bg-pink-700 p-4">
  <div class="mt-4 flex flex-col items-center justify-center gap-2 rounded bg-pink-500 p-4">PROTECTED AREA!</div>
  <button
    class="rounded bg-black p-2 text-white"
    onclick={() => {
      setLoggedIn(true);
      goto("/protected/bankaccount");
    }}>
    Click here to log in..
  </button>
</div>
