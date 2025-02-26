<script lang="ts">
  import { onMount, type Component } from "svelte";
  import { Instance, InstanceConfig } from "./instance.svelte";
  import { normalize } from "./paths";
  import { registry, type RegistryMatch } from "./registry.svelte";

  let { instance = $bindable(), ...rest } = $props<
    { instance?: Instance } & InstanceConfig
  >();

  let RenderableComponent = $state<Component | null>(null);
  let params: any = $state(null);

  const apply = async (match: RegistryMatch) => {
    if (
      typeof match.route.component === "function" &&
      match.route.component.constructor.name === "AsyncFunction"
    ) {
      // Handle async component - await the import
      const module = await match.route.component();
      RenderableComponent = module.default || module;
    } else {
      // Handle regular component
      RenderableComponent = match.route.component;
    }

    if (match.route.params) {
      params = match.route.params;
    }
  };

  const router = new Instance(rest.basePath, new InstanceConfig(rest), apply);
  const r = registry.register(router);

  onMount(() => {
    r.navigate(normalize(location.pathname.replace(rest.basePath || "/", "")));
  });
</script>

<RenderableComponent {params} />
