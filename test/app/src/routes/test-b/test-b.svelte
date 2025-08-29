<script lang="ts">
  import { pop } from "@mateothegreat/svelte5-router";

  setTimeout(() => {
    pop();
  }, 2000);
</script>

<div class="flex flex-col gap-4 rounded-md bg-emerald-300 p-2">
  <h1 class="text-lg font-bold">test-b.svelte</h1>
  <div class="text-sm">This is the test-b page.</div>
  <div class="bg-zinc-950/95 p-2 text-center font-bold text-emerald-400 text-pink-500">In 2 seconds, I will pop back to the previous page...</div>
</div>
