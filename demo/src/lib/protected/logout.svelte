<script lang="ts">
  import { goto } from "@mateothegreat/svelte5-router";
  console.log("logging out");
  localStorage.removeItem("token");
  goto("/protected");
</script>
