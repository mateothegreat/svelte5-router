<script lang="ts">
  import { Anchor } from "lucide-svelte";
  import type { RouteLinkProps } from "./route-link.svelte";
  import RouteLink from "./route-link.svelte";
  import type { RouteTitleProps } from "./route-title.svelte";
  import RouteTitle from "./route-title.svelte";

  export type RouteWrapperProps = {
    router?: string;
    name: string;
    title: RouteTitleProps;
    links: RouteLinkProps[];
    children?: any;
  };

  let { router, name, title, links, children }: RouteWrapperProps = $props();
</script>

<div class="flex flex-col justify-between gap-3 overflow-hidden rounded-lg border-2 bg-black p-3">
  <RouteTitle
    {router}
    file={title.file}
    content={title.content} />
  <div class="flex flex-col gap-4">
    <div class="flex w-fit items-center gap-2 rounded-md border-2 border-slate-900/80 bg-slate-700/80 p-1.5">
      <p class="flex items-center gap-1 text-sm text-slate-300">
        <Anchor class="h-5 w-5 text-indigo-500" />
        <strong>{name}</strong>
        routing:
      </p>
      {#each links as link}
        <RouteLink
          href={link.href}
          label={link.label}
          options={link.options} />
      {/each}
    </div>
    <div class="bg-black">
      {@render children?.()}
    </div>
  </div>
</div>
