<script lang="ts">
  import FileLink from "./file-link.svelte";

  let { title, file, children }: { title?: string; file?: string; children: any } = $props();
</script>

<div class="flex flex-col gap-1 rounded-md border-2 border-slate-700 bg-gray-900 text-slate-400">
  <div class="flex items-center justify-between bg-slate-800 p-2 text-sm text-slate-500">
    <p class="flex items-center gap-2 font-mono">
      {#if title}
        &lt;{title} /&gt;
      {/if}
    </p>
    {#if file}
      <FileLink {file} />
    {/if}
  </div>
  {@render children()}
</div>
