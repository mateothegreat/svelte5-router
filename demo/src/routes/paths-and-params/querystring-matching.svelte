<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import Code from "$lib/components/code.svelte";
  import InlineCode from "$lib/components/inline-code.svelte";

  let { route } = $props();
</script>

{#snippet content()}
  The route uses the pattern <InlineCode text="/\/?<child>.*)/" /> which captures everything after the base path and passes
  it to the component as the `params` prop.
{/snippet}

<div class="flex flex-col gap-4 border-t-2 border-slate-800 pt-4">
  <div class="flex flex-col gap-5">
    <div class="w-fit px-2 flex items-center gap-1 font-bold text-indigo-300 bg-gray-800 rounded-sm p-2">
      <InlineCode text="querystring" />
      match multiple values
      <InlineCode text="RegExp" />
      <InlineCode text="number" />
      <InlineCode text="string" />
    </div>
    <div class="flex flex-col gap-4 text-sm text-gray-400">
      <Badge
        variant="warning"
        class="w-fit">
        Matching will occur if all querystring keys and values match what was provided in the `querystring`
        configuration option.
      </Badge>
      <div class=" gap-1">
        This demo shows how to use the route's
        <InlineCode text="querystring" />
        configuration option to match against the current
        <InlineCode text="location.search" />
        value passed in by the browser.
      </div>
      <Badge
        variant="success"
        class="w-fit">
        There are 2 potential matches for the path /props/query-match-2. Notice how the active route is highlighted in
        green for this route only + the querystring matching.
      </Badge>
    </div>
  </div>
  <div class="flex flex-col gap-6 border-2 bg-gray-900/60 rounded-lg p-4 border-slate-700">
    <Code
      title="$props().route.route value:"
      file="src/routes/paths-and-params/querystring-matching.svelte">
      <div>{JSON.stringify(route.route, null, 2)}</div>
    </Code>
    <Code
      title="$props().route.result value:"
      file="src/routes/paths-and-params/querystring-matching.svelte">
      <div>{JSON.stringify(route.result, null, 2)}</div>
    </Code>
  </div>
</div>
