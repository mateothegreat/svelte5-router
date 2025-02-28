<script lang="ts">
  import { FileCode2, GithubIcon } from "lucide-svelte";

  export type RouteTitleProps = {
    router?: string;
    file: string;
    content?: any;
  };

  let { router, file, content }: RouteTitleProps = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-3 rounded-md bg-slate-900/70 p-1.5 px-2">
    {#if router}
      <div class="flex items-center gap-1 rounded-sm bg-gray-800 px-1.5 py-0.5 text-sm text-slate-500">
        $router:
        <span class="px-1 py-0.5 text-fuchsia-400">
          {router}
        </span>
      </div>
    {/if}
    <div class="flex flex-1 justify-between">
      <a
        href={`https://github.com/mateothegreat/svelte5-router/blob/main/demo/${file}`}
        class="flex cursor-pointer items-center gap-1 text-center text-sm text-slate-500 hover:font-medium hover:text-indigo-400">
        <FileCode2 class="h-4 w-4" />
        {file}
      </a>
      <a
        href={`https://github.com/mateothegreat/svelte5-router/blob/main/demo/${file}`}
        target="_blank"
        class="flex cursor-pointer items-center gap-1 text-center text-sm text-blue-400 hover:font-medium hover:text-indigo-400">
        view source
        <GithubIcon class="h-4 w-4" />
      </a>
    </div>
  </div>
  {#if content}
    {#if typeof content === "string"}
      {content}
    {:else}
      <div class="flex items-center">
        {@render content()}
      </div>
    {/if}
  {/if}
</div>
