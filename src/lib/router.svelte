<script lang="ts">
  import { onDestroy, type Component } from "svelte";
  import { Query } from "./query.svelte";
  import { registry } from "./registry.svelte";
  import type { Route } from "./route.svelte";
  import { RouterInstanceConfig } from "./router-instance-config";
  import type { RouterInstance } from "./router-instance.svelte";

  let { instance = $bindable(), ...rest } = $props<{ instance?: RouterInstance } & RouterInstanceConfig>();

  let RenderableComponent = $state<Component | null>(null);
  let router: RouterInstance;
  let route: Route = $state();

  const apply = async (component: any, r: Route) => {
    route = r;
    if (typeof component === "function" && component.constructor.name === "AsyncFunction") {
      // Handle async component - await the import
      const module = await component();
      RenderableComponent = module.default || module;
    } else {
      // Handle regular component
      RenderableComponent = component;
    }
  };

  router = registry.register(new RouterInstanceConfig(rest), apply);
  router.handleStateChange(location.pathname, new Query());

  instance = router;

  onDestroy(() => {
    router.unregister();
  });
</script>

<RenderableComponent {route} />
