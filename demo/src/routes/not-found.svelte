<script lang="ts">
  console.log(Date.now);
  let { route } = $props();
  $inspect(route);
</script>

<div class="flex flex-col items-center justify-center gap-4">
  <pre class="rounded-md bg-gray-800 p-2 text-sm text-emerald-500">included from "not-found.svelte":</pre>
  <h1 class="text-2xl font-bold">404 not found :(</h1>
  <p class="text-sm text-gray-500">The page you are looking for does not exist.</p>
  <pre class="rounded-md bg-gray-900 p-2 text-sm text-gray-400">$props():

{JSON.stringify(route, null, 2)}
</pre>
</div>
