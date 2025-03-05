<script lang="ts">
  import type { RouteResult, RouterInstance } from "@mateothegreat/svelte5-router";
  import { Anchor } from "lucide-svelte";
  import type { RouteLinkProps } from "./route-link.svelte";
  import RouteLink from "./route-link.svelte";
  import type { RouteTitleProps } from "./route-title.svelte";
  import RouteTitle from "./route-title.svelte";

  export type RouteWrapperProps = {
    router?: RouterInstance;
    name: string;
    route?: RouteResult;
    end?: boolean;
    title: RouteTitleProps;
    links: RouteLinkProps[];
    children?: any;
  };

  let { router = $bindable(), name, route, title, links, children, end = $bindable() }: RouteWrapperProps = $props();
</script>

<div class="flex flex-col justify-between gap-3 overflow-hidden rounded-lg border-2 bg-black p-3">
  <div class="flex flex-col gap-4">
    <RouteTitle
      {router}
      {route}
      {end}
      file={title.file}
      content={title.content} />
    <div class="flex w-fit items-center gap-2 rounded-md border-2 border-slate-900/80 bg-slate-700/80 p-1.5">
      <p class="flex items-center gap-1 text-sm text-slate-300">
        <Anchor class="h-4 w-4 text-indigo-500" />
        <span class="text-pink-400">{router.config.id}</span>
        routes:
      </p>
      {#each links as link}
        <RouteLink {...link} />
      {/each}
    </div>
    <div class="bg-black">
      {@render children?.()}
    </div>
  </div>
</div>
