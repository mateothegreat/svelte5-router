<script lang="ts">
  import { onDestroy, type Component } from "svelte";
  import { registry } from "./registry.svelte";
  import type { Route } from "./route.svelte";
  import { RouterInstanceConfig } from "./router-instance-config";
  import type { RouterInstance } from "./router-instance.svelte";

  let { instance = $bindable(), ...rest } = $props<{ instance?: RouterInstance } & RouterInstanceConfig>();

  let RenderableComponent = $state<Component | null>(null);
  let router: RouterInstance;
  let route: Route = $state();

  const apply = async (r: Route) => {
    route = r;
    if (typeof r.component === "function" && r.component.constructor.name === "AsyncFunction") {
      // Handle async component - await the import
      const module = await r.component();
      RenderableComponent = module.default || module;
    } else {
      // Handle regular component
      RenderableComponent = r.component;
    }
  };

  router = registry.register(new RouterInstanceConfig(rest), apply);
  router.handleStateChange(location.pathname);

  onDestroy(() => {
    router.unregister();
  });
</script>

<RenderableComponent {route} />
