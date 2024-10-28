<script lang="ts">
  import { createContext } from "./context";
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

  const ctx = createContext(routerInstance);
  const route = ctx.instance.current;

  setupHistoryWatcher(base, routerInstance);
</script>

<svelte:component this={$route?.component} route={$route} {parent} />
