<script lang="ts">
  import { BadgeInfo } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import Badge from "./badge.svelte";

  let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div class="flex flex-col gap-4 rounded-md border-4 border-slate-900/80 p-4 text-center text-gray-400 {className}">
  {#if children}
    {@render children()}
  {:else}
    <p>
      <Badge
        variant="info"
        icon={BadgeInfo}>
        There was no path provided to the router, so the default route was used (declared as a snippet).
      </Badge>
    </p>
    Click on a link above to see the different effects!
  {/if}
</div>
