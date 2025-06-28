<script>
  import Container from "$lib/components/container.svelte";
</script>

<Container
  title={"Level_3"}
  file="src/routes/nested/level-1/level-2/level-3/level-3.svelte">
  <div class="flex flex-col gap-3 bg-green-500 p-4 text-center font-medium text-white">
    You've reached the deepest level of nested routing (level-3)!
  </div>
</Container>
