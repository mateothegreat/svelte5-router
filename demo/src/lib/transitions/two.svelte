<script>
  import { fade } from "svelte/transition";
</script>

<div in:fade={{ duration: 300 }}>
  <p class="rounded-sm bg-slate-900 p-2 text-center text-xs text-green-500">two.svelte</p>
  <div class="flex flex-col gap-3 bg-purple-700 p-10">
    <h1>two</h1>
  </div>
</div>
