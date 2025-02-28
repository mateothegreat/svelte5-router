<script lang="ts">
  export type InlineCodeProps = {
    text: string;
    class?: string;
  };

  let { text, class: className }: InlineCodeProps = $props();

  if (!className) {
    className = "text-green-400 bg-zinc-900/70";
  }
</script>

<span class="rounded-md p-1 px-2 font-mono text-sm {className}">{text}</span>
