<script lang="ts">
  import { route, type RouteOptions } from "@mateothegreat/svelte5-router";

  export type RouteLinkProps = {
    options?: RouteOptions;
    href: string;
    label: string;
  };

  let { options, href, label }: RouteLinkProps = $props();

  if (!options) {
    options = {
      default: {
        class: ["inactive", "text-slate-300", "border-slate-600"]
      },
      active: {
        class: ["active", "bg-indigo-600", "text-white", "border-indigo-400"]
      },
      loading: {
        class: ["loading", "bg-orange-500"]
      },
      disabled: {
        class: ["disabled", "bg-gray-500"]
      }
    };
  }
</script>

<a
  use:route={options}
  {href}
  class="duration-400 rounded-sm border-2 px-2.5 py-0.5 text-sm transition-all hover:border-green-300 hover:bg-green-600 hover:text-white">
  {label}
</a>
