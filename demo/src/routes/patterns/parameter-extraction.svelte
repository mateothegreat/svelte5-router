<script lang="ts">
  import { route } from "@mateothegreat/svelte5-router";

  import Code from "$lib/components/code.svelte";
  let { route: r, ...rest } = $props();
</script>

<div class="flex flex-col gap-1">
  <h1 class="text-lg font-semibold text-slate-300 flex items-center gap-1">Parameter Extraction</h1>
  <div class="text-slate-500 text-sm">
    <p>
      Given the following route config, everything after the "/parameter-extraction" will be available as a named
      parameter. This means that the following paths will be matched:
    </p>
    <ul class="list-disc list-inside">
      <li>
        <a
          use:route
          href="/patterns/parameter-extraction/foo">
          parameter-extraction/foo
        </a>
      </li>
      <li>
        <a
          use:route
          href="/patterns/parameter-extraction/bar">
          parameter-extraction/bar
        </a>
      </li>
      <li>
        <a
          use:route
          href="/patterns/parameter-extraction/baz">
          parameter-extraction/baz
        </a>
      </li>
    </ul>
  </div>
</div>

<div class="flex gap-3">
  <Code
    title="RouteConfig:"
    language="typescript"
    class="flex-1">
    {`  const routes: RouteConfig[] = [
  {
    path: /^\/parameter-extraction\/(?<child>.*)$/,
    component: ParameterExtraction
  }
];`}
  </Code>
  <Code
    title="$props().route.result.path.params"
    language="json"
    class="flex-1">
    <div>{JSON.stringify(r.result.path.params, null, 2)}</div>
  </Code>
</div>
