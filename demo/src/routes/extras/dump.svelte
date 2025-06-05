<script lang="ts">
  import Code from "$lib/components/code.svelte";
  let { route, ...rest } = $props();
</script>

<div class="flex flex-col gap-3">
  <Code
    title="usage:"
    file="src/routes/extras/dump.svelte"
    class="flex-1">
    {`<script lang="ts">
  let { route, ...rest } = $props();
  console.log(route, rest);
</script>`}
  </Code>

  <div class="flex gap-3">
    <Code
      title="$props().route"
      language="json"
      class="flex-1">
      <div>{JSON.stringify(route, null, 2)}</div>
    </Code>

    <Code
      title="$props().rest"
      language="json"
      class="flex-1">
      <div>{JSON.stringify(rest, null, 2)}</div>
    </Code>
  </div>
</div>
