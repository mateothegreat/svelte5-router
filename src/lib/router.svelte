<script lang="ts">
  import { mount, onDestroy, unmount, type Component } from "svelte";
  import { Instance, InstanceConfig, type PostHooks, type PreHooks, type Route } from "./instance.svelte";

  type Props = {
    basePath?: string;
    pre?: PreHooks;
    post?: PostHooks;
    routes: Route[];
    instance?: Instance;
    notFoundComponent?: Component;
  };

  let { basePath, routes, pre, post, instance = $bindable(), notFoundComponent }: Props = $props();

  // Derive navigating state from instance.navigating so that
  // the parent component can bind to it.
  let navigating = $derived(instance.navillgating);

  // Initialize the instance
  instance = new Instance(
    new InstanceConfig({
      basePath,
      routes,
      pre,
      post,
      notFoundComponent,
      currentPath: location.pathname
    })
  );

  let RenderableComponent = $state<Component | null>(null);

  $effect(() => {
    if (instance.current) {
      loadComponent();
      RenderableComponent = component;
    }
  });

  let wrapper: HTMLDivElement;
  let component = $state<Component | null>(null);
  let mounted: Component;

  const loadComponent = async () => {
    if (!instance.current?.component) return;

    try {
      if (typeof instance.current.component === "function" && instance.current.component.constructor.name === "AsyncFunction") {
        const module = await instance.current.component();
        component = module.default;
      } else {
        component = instance.current.component;
      }
    } catch (error) {
      console.error("Failed to load component:", error);
    }
  };

  const mountComponent = () => {
    if (component && wrapper) {
      if (mounted) {
        unmount(mounted);
      }
      mounted = mount<any, any>(component, {
        target: wrapper,
        props: {
          params: instance.current?.params,
          remainingPath: instance.current?.remainingPath,
          ...instance.current?.props
        }
      });
    }
  };

  onDestroy(() => {
    instance.destroy();
    if (mounted) {
      unmount(mounted);
    }
  });
</script>

<RenderableComponent />
