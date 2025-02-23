<script lang="ts">
  import { route, Router, type Route } from "@mateothegreat/svelte5-router";

  let { params }: { params: string[] } = $props();

  const routes: Route[] = [
    {
      path: "(?<child>.*)",
      component: output
    },
    {
      path: "",
      component: snippet
    }
  ];
</script>

{#snippet output()}
  <div class="flex flex-col gap-3 bg-indigo-400 p-4">
    <pre>params: string[] <em>from</em> $props() <em>value is:</em></pre>
    <pre class="rounded-sm bg-black p-2 text-xs text-green-500">{JSON.stringify(params, null, 2)}</pre>
  </div>
{/snippet}
{#snippet snippet()}
  <div class="flex flex-col gap-3 bg-green-400 p-4">
    I'm a snippet!<br />
    Click on a link above to see the params..
  </div>
{/snippet}

<div class="flex flex-col gap-3 bg-gray-400 p-4">
  <p class="rounded-sm bg-black p-2 text-center text-xs text-green-500">params.svelte</p>
  <h1>Params Links</h1>
  <div class="flex gap-2 rounded-sm bg-black p-4">
    <a use:route href="/params/foo" class="rounded-sm bg-blue-500 px-2">/params/foo</a>
    <a use:route href="/params/bar" class="rounded-sm bg-blue-500 px-2">/params/bar</a>
    <a use:route href="/params/one" class="rounded-sm bg-blue-500 px-2">/params/one</a>
  </div>

  <div class="rounded-sm bg-black p-4 shadow-xl">
    <Router basePath="/params" {routes} />
  </div>
</div>
