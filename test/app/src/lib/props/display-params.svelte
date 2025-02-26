<script lang="ts">
  let props = $props();
</script>

<div class="flex flex-col justify-between gap-4 p-1">
  <div class="flex-1 rounded-sm bg-slate-600 p-2">
    The route uses the pattern <span class="rounded-sm bg-black p-1 font-mono text-xs text-green-500">/\/?&lt;child&gt;.*)/</span>
    which captures everything after the base path and passes it to the component as the `params` prop.
  </div>
  <pre class="flex flex-1 flex-col gap-3">
    <div class="text-slate-400">$props() value:</div>
    <div class="text-green-500">{JSON.stringify(props, null, 2)}</div>
  </pre>
</div>
