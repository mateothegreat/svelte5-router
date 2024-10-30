<script lang="ts">
  import type { Writable } from "svelte/store";
  import { Instance, setupHistoryWatcher, type PostHooks, type PreHooks, type Route } from "./instance.svelte";

  type Props = {
    pre?: PreHooks;
    post?: PostHooks;
    routes: Route[];
    navigating?: Writable<boolean>;
  };

  let { routes, pre, post, navigating = $bindable() }: Props = $props();

  const instance = new Instance(routes, pre, post);

  navigating = instance.navigating;

  setupHistoryWatcher(instance);
</script>

{#if instance.current}
  {#key instance.current.component}
    <instance.current.component params={instance.current.params} {...instance.current.props} />
  {/key}
{/if}
