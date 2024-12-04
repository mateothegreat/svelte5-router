<script lang="ts">
  import { mount, onDestroy, unmount, type Component } from "svelte";
  import { Instance, setupHistoryWatcher, type PostHooks, type PreHooks, type Route } from "./instance.svelte";

  type Props = {
    basePath?: string;
    pre?: PreHooks;
    post?: PostHooks;
    routes: Route[];
    instance?: Instance;
    navigating?: boolean;
  };

  let { basePath, routes, pre, post, instance = $bindable() }: Props = $props();

  // Initialize the instance
  instance = new Instance(basePath, routes, pre, post);

  // Setup history watcher which updates the instance's current
  // route based on `pushState` and `popState` events.
  setupHistoryWatcher(instance);

  $effect(() => {
    if (route) {
      loadComponent().then(() => {
        mountComponent();
      });
    }
  });

  // Set up the initial route so that the component is rendered.
  const route = instance.get(location.pathname);
  if (route) {
    instance.run(route.routeIndex);
  }

  let wrapper: HTMLDivElement;
  let component = $state<Component | null>(null);
  let mounted: Component;

  const loadComponent = async () => {
    if (instance.current) {
      if (instance.current.component.constructor.name === "AsyncFunction") {
        const routeBefore = instance.currentIndex;
        instance.navigating = true;
        const module = await instance.current.component();
        if (instance.currentIndex !== routeBefore) {
          return;
        }
        component = module.default;
        if (instance.navigating) {
          instance.navigating = false;
        }
      } else {
        component = instance.current.component;
      }
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
          ...instance.current?.props
        }
      });
    }
  };

  onDestroy(() => {
    if (mounted) {
      unmount(mounted);
    }
  });
</script>

<div bind:this={wrapper}></div>
