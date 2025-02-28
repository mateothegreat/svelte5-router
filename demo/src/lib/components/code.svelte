<script lang="ts">
  let { title, children } = $props();
</script>

<div class="flex flex-col gap-1 overflow-hidden rounded-md bg-gray-900">
  <div class="bg-slate-800 p-2 text-sm text-slate-500">{title}</div>
  <pre
    contenteditable
    class="overflow-auto p-2 font-mono text-sm text-green-500">{@render children()}</pre>
</div>
