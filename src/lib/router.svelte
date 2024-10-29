<script lang="ts">
  import { Instance, setupHistoryWatcher, type PostHooks, type PreHooks, type Route } from "./instance.svelte";

  type Props = {
    pre?: PreHooks;
    post?: PostHooks;
    routes: Route[];
  };

  let { routes, pre, post }: Props = $props();

  const instance = new Instance(routes, pre, post);

  setupHistoryWatcher(instance);
</script>

{#if instance.current}
  <instance.current.component params={instance.current.params} {...instance.current.props} />
{/if}
