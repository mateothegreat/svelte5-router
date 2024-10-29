<script lang="ts">
  import { Instance, setupHistoryWatcher, type ParentRoute, type Route } from "./instance";

  type Props = {
    instance?: Instance;
    base: string;
    routes: Route[];
    parent?: ParentRoute;
  };

  let { instance = $bindable(), base, routes, parent }: Props = $props();

  const routerInstance = new Instance(base, routes, parent);

  instance = routerInstance;

  setupHistoryWatcher(base, routerInstance);

  const current = routerInstance.current;
</script>

<svelte:component this={$current?.component} route={$current} {...$current?.props} {parent} />
