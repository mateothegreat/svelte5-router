<script lang="ts">
  import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from "lucide-svelte";
  import type { Snippet } from "svelte";

  let { icon, text, variant = "info", children }: { icon?: any; text?: string; variant?: "info" | "success" | "warning" | "error"; children?: Snippet } = $props();

  const variants = {
    info: {
      classes: "bg-blue-900 text-white",
      icon: InfoIcon
    },
    success: {
      classes: "bg-green-900 text-white",
      icon: CheckCircleIcon
    },
    warning: {
      classes: "bg-yellow-900 text-black",
      icon: AlertTriangleIcon
    },
    error: {
      classes: "bg-red-900/80",
      icon: XCircleIcon
    }
  };

  let Icon = variants[variant].icon;
</script>

<span class="rounded-sm p-2 text-sm {variants[variant].classes}">
  {#if Icon}
    <Icon class="inline-block h-5 w-5" />
  {/if}
  {text}
  {@render children?.()}
</span>
