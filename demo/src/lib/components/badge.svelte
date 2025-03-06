<script lang="ts">
  import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from "lucide-svelte";
  import type { Snippet } from "svelte";

  let {
    icon,
    text,
    variant = "info",
    class: className,
    children
  }: {
    icon?: any;
    text?: string;
    variant?: "info" | "success" | "warning" | "error";
    class?: string;
    children?: Snippet;
  } = $props();

  const variants = {
    info: {
      classes: "bg-blue-900 text-white",
      icon: InfoIcon
    },
    success: {
      classes: "bg-green-600/80 text-white",
      icon: CheckCircleIcon
    },
    warning: {
      classes: "bg-yellow-200/80 text-black",
      icon: AlertTriangleIcon
    },
    error: {
      classes: "bg-red-900/80 text-white",
      icon: XCircleIcon
    }
  };

  let Icon = icon ?? variants[variant].icon;
</script>

<span
  class="inline-flex items-center gap-1.5 rounded-sm p-2 text-sm font-medium {variants[variant].classes} {className}">
  {#if Icon}
    <Icon class="inline-block h-5 w-5" />
  {/if}
  {text}
  {@render children?.()}
</span>
