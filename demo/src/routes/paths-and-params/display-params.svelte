<script lang="ts">
  import Code from "$lib/components/code.svelte";
  import InlineCode from "$lib/components/inline-code.svelte";

  let { route } = $props();
</script>

{#snippet content()}
  The route uses the pattern <InlineCode text="/\/?<child>.*)/" /> which captures everything after the base path and passes
  it to the component as the `params` prop.
{/snippet}

<Code
  title="params.route value:"
  file="src/routes/props/display-params.svelte">
  <div>{JSON.stringify(route, null, 2)}</div>
</Code>
