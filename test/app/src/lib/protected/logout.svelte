<script lang="ts">
  import { goto } from "@mateothegreat/svelte5-router";
</script>

<button
  onclick={() => {
    localStorage.removeItem("token");
    goto("/");
  }}>
  Click here to log out..
</button>
