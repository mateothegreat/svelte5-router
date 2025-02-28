<script lang="ts">
  import Code from "$lib/components/code.svelte";
  import InlineCode from "$lib/components/inline-code.svelte";
  import RouteTitle from "$lib/components/routes/route-title.svelte";

  let props = $props();
</script>

{#snippet content()}
  The route uses the pattern <InlineCode text="/\/?<child>.*)/" /> which captures everything after the base path and passes it to the component as the `params` prop.
{/snippet}

<div class="flex flex-col justify-between gap-4">
  <RouteTitle
    router="props-router"
    file="src/routes/props/display-params.svelte"
    {content} />
  <Code title="$props() value:">
    <div>{JSON.stringify(props, null, 2)}</div>
  </Code>
</div>
