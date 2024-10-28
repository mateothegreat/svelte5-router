<script lang="ts">
  import type { Route } from "@mateothegreat/svelte5-router";

  let { route }: { route: Route } = $props();
</script>

<pre>{JSON.stringify(route.params, null, 2)}</pre>
