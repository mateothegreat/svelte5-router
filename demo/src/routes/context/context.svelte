<script lang="ts">
  import { getContext } from "svelte";

  const ctx = getContext("foo");
</script>

<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <p class="rounded-md bg-black p-2 text-center text-xs text-green-500">/context/context.svelte</p>
  <p class="rounded-md p-2 text-sm text-black">This demo shows how to use the `getContext` function to access the context from a parent component.</p>
  <div class="flex flex-col gap-2 rounded-md bg-black p-4 shadow-xl">
    Given:
    <pre class="rounded-md bg-gray-800 p-2 text-sm text-green-500">const ctx = getContext("foo");</pre>
    We get:
    <pre class="rounded-md bg-gray-800 p-2 text-sm text-gray-100">{JSON.stringify(ctx, null, 2)}</pre>
  </div>
</div>
