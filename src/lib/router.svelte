<script lang="ts">
  import { get, Instance, setupHistoryWatcher, type PostHooks, type PreHooks, type Route } from "./instance.svelte";

  type Props = {
    pre?: PreHooks;
    post?: PostHooks;
    routes: Route[];
    navigating?: boolean;
    instance?: Instance;
  };

  let { routes, pre, post, navigating = $bindable(), instance = $bindable() }: Props = $props();

  // Initialize the instance
  instance = new Instance(routes, pre, post);

  // Setup history watcher which updates the instance's current
  // route based on `pushState` and `popState` events.
  setupHistoryWatcher(instance);

  // Derive navigating state from instance.navigating so that
  // the parent component can bind to it.
  $effect(() => {
    navigating = instance.navigating;
  });

  // Set up the initial route so that the component is rendered.
  instance.run(get(instance, routes, location.pathname));
</script>

{#if instance.current}
  {#key instance.current.component}
    <instance.current.component params={instance.current.params} {...instance.current.props} />
  {/key}
{/if}
