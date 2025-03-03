<script lang="ts">
  import { onDestroy, type Component } from "svelte";
  import { createSpan, Span } from "./helpers/tracing.svelte";
  import { Path } from "./path";
  import { Query } from "./query.svelte";
  import { registry } from "./registry.svelte";
  import type { Route } from "./route.svelte";
  import { RouterInstanceConfig } from "./router-instance-config";
  import type { RouterInstance } from "./router-instance.svelte";

  const path = new Path();
  const span = createSpan(path.toURI());

  span?.trace({
    name: "<Router/>",
    description: "there is a new <Router> component mounted",
    metadata: {
      location: "/src/lib/router.svelte:mount()"
    }
  });

  let { instance = $bindable(), ...rest } = $props<{ instance?: RouterInstance } & RouterInstanceConfig>();

  let RenderableComponent = $state<Component | null>(null);
  let router: RouterInstance;
  let route: Route = $state();

  const apply = async (component: any, r: Route, span?: Span) => {
    route = r;
    span?.trace({
      name: "apply",
      description: "apply route",
      metadata: {
        location: "/src/lib/router.svelte:apply()",
        router: {
          id: router.config.id,
          basePath: router.config.basePath
        },
        route
      }
    });
    if (typeof component === "function" && component.constructor.name === "AsyncFunction") {
      // Handle async component - await the import
      const module = await component();
      RenderableComponent = module.default || module;
    } else {
      // Handle regular component
      RenderableComponent = component;
    }
  };

  router = registry.register(new RouterInstanceConfig(rest), apply, span);

  if (span) {
    span.metadata = {
      router: router.config.id
    };
  }

  router.handleStateChange(
    location.pathname,
    !!window.location.search ? new Query(Object.fromEntries(new URLSearchParams(window.location.search))) : undefined,
    span
  );

  instance = router;

  $effect(() => {
    $inspect(span);
  });

  onDestroy(() => {
    router.unregister();
  });
</script>

<RenderableComponent {route} />
