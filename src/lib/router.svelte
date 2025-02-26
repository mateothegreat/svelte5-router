<script lang="ts">
  import { onDestroy, onMount, type Component } from "svelte";
  import { log } from "./logger";
  import { registry } from "./registry.svelte";
  import type { Route } from "./route.svelte";
  import { RouterInstanceConfig } from "./router-instance-config";
  import type { RouterInstance } from "./router-instance.svelte";

  let { instance = $bindable(), ...rest } = $props<
    { instance?: RouterInstance } & RouterInstanceConfig
  >();

  let RenderableComponent = $state<Component | null>(null);
  let params: any = $state(null);
  let r: RouterInstance;

  const apply = async (route: Route) => {
    log.debug(r.config.id, "apply", route);
    if (
      typeof route.component === "function" &&
      route.component.constructor.name === "AsyncFunction"
    ) {
      // Handle async component - await the import
      const module = await route.component();
      RenderableComponent = module.default || module;
    } else {
      // Handle regular component
      RenderableComponent = route.component;
    }

    if (route.params) {
      params = route.params;
    }
  };

  r = registry.register(new RouterInstanceConfig(rest), apply);

  onMount(() => {
    if (r) {
      r.handleStateChange(location.pathname);
    }
  });

  onDestroy(() => {
    if (r) {
      r.unregister();
    }
  });
</script>

<RenderableComponent {params} />
