<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    console.log("async child.svelte", "onMount");
  });
</script>

<p class="rounded-md bg-slate-900 p-2 text-center text-xs text-green-500">/async/child.svelte</p>
<div class="flex flex-col gap-3 bg-slate-700 p-10">
  <h1>child of parent async component</h1>
</div>
