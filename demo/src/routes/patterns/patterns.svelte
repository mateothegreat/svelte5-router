<script lang="ts">
  import { route, type RouteConfig } from "@mateothegreat/svelte5-router";
  import Router from "@mateothegreat/svelte5-router/router.svelte";
  import type { TableColumn } from "@mateothegreat/svelte5-table";
  import { DropinTable } from "@mateothegreat/svelte5-table";
  import { CirclePlay, MousePointerClick } from "lucide-svelte";
  import { writable, type Writable } from "svelte/store";
  import Dump from "./dump.svelte";

  type Component = {
    name: string;
    description: string;
    path: string;
  };

  const columns: TableColumn[] = [
    {
      field: "name",
      header: "Routing Pattern"
    },
    {
      field: "description",
      header: "Description"
    },
    {
      field: "actions",
      header: customHeader,
      class: "w-[300px]",
      renderer: action
    }
  ];

  const components: Writable<Component[]> = writable([
    {
      name: "Default Route",
      description: "If the path is empty, the route will be matched otherwise evaluation will continue.",
      path: "/default-route"
    },
    {
      name: "Single Path",
      description: "This example will match any path that starts with `/path`.",
      path: "/single-path"
    },
    {
      name: "Nested Paths",
      description: "This example will match any path that starts with `/path/path/path` and can be nested further.",
      path: "/nested-paths"
    },
    {
      name: "Parameter Extraction",
      description: "Combine arbitrary paths and extractable parameters.",
      path: "/parameter-extraction"
    },
    {
      name: "Named Parameters",
      description:
        "This example will match any path that starts with `/path/path/path/path` and can be nested further.",
      path: "/named-parameters"
    }
  ]);

  let selections = writable([]);
  const routes: RouteConfig[] = [
    {
      path: "default-route",
      component: Dump
    }
  ];
</script>

{#snippet customHeader()}
  <div class="flex items-center gap-1 pl-2">
    Navigate to Demo
    <CirclePlay class="h-4 w-4 text-green-500" />
  </div>
{/snippet}

{#snippet action(row: any)}
  <div class="flex flex-1">
    <a
      use:route
      href={`/patterns${row.path}`}
      class="bg-gray-800/50 flex items-center gap-1 rounded-sm border-2 border-purple-700 px-2 py-1 text-sm text-slate-500 transition-all hover:border-green-300 hover:bg-slate-200/20 hover:text-white duration-400">
      <MousePointerClick class="h-4 w-4" />
      <span class="text-green-500 flex items-center gap-0.5">
        goto("
        <span class="text-sky-400">
          {row.path}
        </span>
        ")
      </span>
    </a>
  </div>
{/snippet}

<div class="flex flex-col gap-1">
  <h1 class="text-lg font-semibold text-slate-300">Routing Patterns</h1>
  <p class="text-slate-500 text-sm">This page contains an assortment of routing patterns to help you get started.</p>
</div>

<div class="bg-slate-700/20 text-slate-600 mt-10 py-2 border border-slate-800 rounded-lg">
  <DropinTable
    {columns}
    data={$components}
    bind:selections />
</div>

<div class="flex flex-col gap-2">
  <Router
    basePath="/patterns"
    myExtraRouterProp={{
      calledFrom: "patterns <Router />"
    }}
    {routes} />
</div>
