<script lang="ts">
  import { Query } from "@mateothegreat/svelte5-router";

  const query = new Query();
  if (!query.get<string>("test", "")) {
    query.set("test", "email");
  }
</script>

<div>
  <pre>{JSON.stringify(query, null, 2)}</pre>
</div>
