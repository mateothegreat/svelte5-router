<script lang="ts">
  import { goto } from "@mateothegreat/svelte5-router";
</script>

<button
  onclick={() => {
    localStorage.setItem("token", "true");
    goto("/protected");
  }}>
  Click here to log in..
</button>
