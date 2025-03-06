<script lang="ts">
  import { session } from "$lib/session.svelte";
  import { route, RouteOptions } from "@mateothegreat/svelte5-router";

  export type RouteLinkProps = {
    options?: RouteOptions;
    href: string;
    label: string;
  };

  let { options, href, label }: RouteLinkProps = $props();
  if (!options) {
    options = new RouteOptions();
  }

  if (!options.active) {
    options.active = {
      class: ["active", "bg-indigo-600", "text-white", "border-indigo-400"]
    };
  }
  if (!options.default) {
    options.default = {
      class: ["inactive", "text-slate-300", "border-slate-500/50"]
    };
  }
  if (!options.loading) {
    options.loading = {
      class: ["loading", "bg-orange-500"]
    };
  }
  if (!options.disabled) {
    options.disabled = {
      class: ["disabled", "bg-gray-500"]
    };
  }

  if (!options.active.class) {
    options.active.class = ["active", "bg-indigo-600", "text-white", "border-indigo-400"];
  }

  if (!options.default.class) {
    options.default.class = ["inactive", "text-slate-300", "border-slate-500/50"];
  }
  if (!options.loading.class) {
    options.loading.class = ["loading", "bg-orange-500"];
  }
  if (!options.disabled.class) {
    options.disabled.class = ["disabled", "bg-gray-500"];
  }
</script>

<a
  use:route={options}
  href={session.mode === "hash" ? `/#${href}` : href}
  class="duration-400 flex items-center rounded-sm border-2 px-2.5 py-0.5 text-sm transition-all hover:border-green-300 hover:bg-green-600 hover:text-white">
  {#if session.mode === "hash"}
    <span>/#</span>
    <span>/{label.startsWith("/") ? label.slice(1) : label}</span>
  {:else}
    <span>
      {label}
    </span>
  {/if}
</a>
