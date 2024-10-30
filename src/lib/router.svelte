<script lang="ts">
  import type { Writable } from "svelte/store";
  import { Instance, setupHistoryWatcher, get, type PostHooks, type PreHooks, type Route } from "./instance.svelte";

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

  // Use the existing get function to find the initial route
  $effect.pre(() => {
    const route = get(instance, routes, location.pathname);
    if (route) instance.run(route);
  });
</script>

{#if instance.current}
  {#key instance.current.component}
    <instance.current.component params={instance.current.params} {...instance.current.props} />
  {/key}
{/if}
