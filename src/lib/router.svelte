<script lang="ts">
  import { Instance, setupHistoryWatcher, type ParentRoute, type Route } from "./instance.svelte";

  type Props = {
    instance?: Instance;
    base: string;
    routes: Route[];
    parent?: ParentRoute;
  };

  let { base, routes, parent }: Props = $props();

  const routerInstance = new Instance(base, routes);

  setupHistoryWatcher(base, routerInstance);
</script>

{#if routerInstance.current}
  <routerInstance.current.component params={routerInstance.current.params} {...routerInstance.current.props} />
{/if}
