<script lang="ts">
  import type { RouteResult, RouterInstance } from "@mateothegreat/svelte5-router";
  import { ArrowDown, ArrowRight, ArrowRightFromLine, StopCircle } from "lucide-svelte";
  import FileLink from "../file-link.svelte";

  export type RouteTitleProps = {
    router?: RouterInstance;
    route?: RouteResult;
    file?: string;
    content?: any;
    end?: boolean;
  };

  let { router = $bindable(), route, file, content, end }: RouteTitleProps = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-3 rounded-md bg-slate-900/70 p-1.5 px-2">
    {#if router}
      <div class="flex flex-wrap items-center rounded-sm bg-gray-800 px-1.5 py-0.5 text-sm text-slate-500">
        <ArrowRightFromLine class="h-4 w-4 text-green-400 mr-1" />
        {router.config.id}
        {#if router.navigating}
          <span class="px-1 py-0.5 text-red-400">(hooks firing)</span>
        {:else}
          <span class="px-1 py-0.5 text-slate-600">(idle)</span>
        {/if}
        routed the path
        <span class="px-1 py-0.5 text-green-400">
          {route?.absolute?.()}
        </span>
        and nesting&nbsp;
        {#if end}
          <span class="flex items-center gap-1 whitespace-nowrap">
            <span class="text-red-400">stopped</span>
            <StopCircle class="h-4 w-4 text-red-400" />
          </span>
        {:else}
          <span class="flex items-center gap-1 whitespace-nowrap">
            <span class="text-green-400">continued</span>
            <ArrowDown class="h-4 w-4 text-green-400" />
          </span>
        {/if}
      </div>
    {/if}
    <ArrowRight class="h-4 w-4 text-slate-500" />
    <FileLink {file} />
  </div>
  {#if content}
    <div class="p-2">
      {#if typeof content === "string"}
        <div class="flex flex-col items-center gap-2 text-center text-slate-400">
          <div class="max-w-3xl text-sm text-slate-500">
            {content}
          </div>
        </div>
      {:else}
        <div class="flex items-center">
          {@render content()}
        </div>
      {/if}
    </div>
  {/if}
</div>
