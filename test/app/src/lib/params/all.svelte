<script lang="ts">
  let { params }: { params: string[] } = $props();
  $inspect(params);
</script>

<pre>{JSON.stringify(params, null, 2)}</pre>
