<script lang="ts">
  import { route } from "@mateothegreat/svelte5-router";

  console.log(location.hash);
</script>

<a
  use:route
  href="/hash/#b?test=4">
  b
</a>

<a
  use:route
  href="/hash/#a?test=123">
  a
</a>
