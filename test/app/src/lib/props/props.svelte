<script lang="ts">
  let { myProp } = $props();

  // For debugging only:
</script>

<div class="flex flex-col gap-3 bg-gray-400 p-10">
  <p class="rounded-sm bg-black p-2 text-center text-xs text-green-500">props.svelte</p>
  <h1>Props:</h1>
  <div class="rounded-sm bg-black p-4 shadow-xl">
    <pre class="text-xs text-zinc-500">{JSON.stringify(myProp, null, 2)}</pre>
  </div>
</div>
