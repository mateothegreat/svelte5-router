<script lang="ts">
  import { Code2 } from "lucide-svelte";
  import FileLink from "./file-link.svelte";

  let {
    title,
    file,
    class: className,
    children
  }: { title?: string; file?: string; class?: string; children: any } = $props();
</script>

<div class="flex flex-col overflow-hidden rounded-md border-2 border-slate-700 bg-black/60">
  <div class="flex items-center justify-between bg-slate-800 p-2 text-sm text-slate-500">
    <p class="flex items-center gap-1 font-mono text-slate-400">
      <Code2 class="h-4 w-4  text-orange-500" />
      {title}
    </p>
    {#if file}
      <FileLink {file} />
    {/if}
  </div>
  <pre
    contenteditable
    class="overflow-auto p-2 font-mono text-sm text-green-500 {className}">{@render children()}</pre>
</div>
