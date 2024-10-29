<script lang="ts">
  let { params }: { params: string[] } = $props();
</script>

<pre>{JSON.stringify(params, null, 2)}</pre>
