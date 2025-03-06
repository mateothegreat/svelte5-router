<script lang="ts">
  import { onDestroy, type Component } from "svelte";
  import { createSpan, Span } from "./helpers/tracing.svelte";
  import { registry } from "./registry.svelte";
  import { type RouteResult } from "./route.svelte";
  import { RouterInstanceConfig } from "./router-instance-config";
  import type { RouterInstance } from "./router-instance.svelte";

  let { instance = $bindable(), ...rest } = $props<{ instance?: RouterInstance } & RouterInstanceConfig>();

  const span = createSpan(rest.id ? `[${rest.id}]` : "router");

  let RenderableComponent = $state<Component | null>(null);
  let router: RouterInstance;
  let route: RouteResult = $state();

  const apply = async (r: RouteResult, span?: Span) => {
    route = r;
    span?.trace({
      prefix: "✅",
      name: "apply",
      description: `<Router${router.config.id ? ` id="${router.config.id}"` : ""}/> applying route ${r.result.path.original} (${r.result.path.condition})`,
      metadata: {
        location: "/src/lib/router.svelte:apply()",
        router: {
          id: router.config.id,
          basePath: router.config.basePath
        },
        result: r
      }
    });
    if (typeof r.result.component === "function" && r.result.component.constructor.name === "AsyncFunction") {
      // Handle async component by first awaiting the import:
      const module = await r.result.component();
      RenderableComponent = module.default || module;
    } else {
      // Handle regular component by directly assigning the component:
      RenderableComponent = r.result.component;
    }
  };

  router = registry.register(new RouterInstanceConfig(rest), apply, span);

  span?.trace({
    prefix: "✅",
    name: "<Router/> Component",
    description: "new component mounted",
    metadata: {
      router: {
        id: router.config.id,
        basePath: router.config.basePath
      },
      location: "/src/lib/router.svelte:mount()"
    }
  });

  instance = router;

  if (span) {
    span.metadata = {
      router: router.config.id
    };
  }

  router.handleStateChange(location.toString(), span);

  onDestroy(() => {
    router.deregister(span);
  });
</script>

<RenderableComponent {route} />
