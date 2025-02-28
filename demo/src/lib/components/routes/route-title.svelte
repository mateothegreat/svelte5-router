<script lang="ts">
  import type { Routed } from "@mateothegreat/svelte5-router";
  import { ArrowDown, ArrowRight, ArrowRightFromLine, StopCircle } from "lucide-svelte";
  import FileLink from "../file-link.svelte";

  export type RouteTitleProps = {
    router?: string;
    route?: Routed;
    file: string;
    content?: any;
    end?: boolean;
  };

  let { router, route, file, content, end }: RouteTitleProps = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-3 rounded-md bg-slate-900/70 p-1.5 px-2">
    {#if router}
      <div class="flex items-center gap-1 rounded-sm bg-gray-800 px-1.5 py-0.5 text-sm text-slate-500">
        <ArrowRightFromLine class="h-4 w-4 text-green-400" />
        {#if route}
          the path
          <span class="px-1 py-0.5 text-green-400">
            {route?.path?.after || "(all paths)"}
          </span>
          routed through
          <span class="px-1 py-0.5 text-fuchsia-400">
            {router}
          </span>
          {#if end}
            and routing
            <span class="px-1 py-0.5 text-red-400">ended</span>
            <StopCircle class="h-4 w-4 text-red-400" />
          {:else}
            and routing
            <span class="px-1 py-0.5 text-green-400">continued</span>
            <ArrowDown class="h-4 w-4 text-green-400" />
          {/if}
        {:else}
          <span class="px-1 py-0.5 text-yellow-500">all paths</span>
          route through
          <span class="px-1 py-0.5 text-fuchsia-400">
            {router}
          </span>
        {/if}
      </div>
    {/if}
    <ArrowRight class="h-4 w-4 text-slate-500" />
    <FileLink {file} />
  </div>
  <div class="p-2">
    {#if content}
      {#if typeof content === "string"}
        <div class="flex flex-col items-center gap-2 text-center text-slate-400">
          {content}
        </div>
      {:else}
        <div class="flex items-center">
          {@render content()}
        </div>
      {/if}
    {/if}
  </div>
</div>
