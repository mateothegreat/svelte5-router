<!--
 * @category components
 * @module
 -->
<script lang="ts">
  import { onDestroy, unmount, type Component } from "svelte";
  import { Instance, InstanceConfig } from "./instance.svelte";

  /**
   * Signatures for the props accepted and exposed by this component.
   *
   * @type {Props}
   */
  type Props = {
    instance: Instance;
    rest: InstanceConfig;
  };

  /**
   * Destructure the props passed to the component and bind the
   * `instance` prop to the instantiated router instance so that
   * it can be used by the caller.
   *
   * Note: The `instance` prop is meant to be read by the caller
   * and is set by the router instance when it is created below.
   *
   * @type {Props}
   */
  // @ts-ignore - any is used here due to svelte lacking type inference for props that are destructured using the spread operator.
  let { instance = $bindable(), ...rest }: any = $props();

  /**
   * The mounted component.
   *
   * @type {Component}
   */
  let mounted: Component;

  /**
   * The renderable component.
   *
   * @type {Component}
   */
  let RenderableComponent = $state<Component | null>(null);

  /**
   * Initialize the router instance with the router config
   * passed in as props.
   */
  let router = new Instance(new InstanceConfig(rest));
  instance = router;

  /**
   * Effectively run the `loadComponent` function when the
   * current route changes.
   */
  $effect(() => {
    if (router.current) {
      loadComponent();
    }
  });

  /**
   * Load the component for the current route.
   *
   * If the component is an async function, load the component
   * and set the `RenderableComponent` to the default export
   * of the module.
   *
   * Otherwise, set the `RenderableComponent` to the component
   *
   */
  const loadComponent = async () => {
    if (
      typeof router.current.component === "function" &&
      router.current.component.constructor.name === "AsyncFunction"
    ) {
      const module = await router.current.component();
      RenderableComponent = module.default;
    } else {
      RenderableComponent = router.current.component;
    }
  };

  /**
   * Destroy the router instance when the component is removed
   * from the DOM.
   */
  onDestroy(() => {
    router.destroy();
    if (mounted) {
      unmount(mounted);
    }
  });
</script>

<RenderableComponent params={router.current?.params} />
