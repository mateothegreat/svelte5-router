<script lang="ts">
  import { Query } from "@mateothegreat/svelte5-router";

  const query = new Query();

  if (!query.get<string>("test", "")) {
    query.set("test", "email");
    query.goto("/query-redirect/testing");
  }

  console.log("query: test =", query.get("test", ""));
</script>

<div>
  <pre>
query.params:

{JSON.stringify(query.params, null, 2)}
  </pre>
</div>
