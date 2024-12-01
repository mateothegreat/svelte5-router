<script lang="ts">
  import { QueryString } from "@mateothegreat/svelte5-router";

  const query = new QueryString();
  if (!query.get<string>("test", "")) {
    query.set("test", "email");
    // goto("/query-redirect/testing", {
    //   test: "email"
    // });
  }
</script>

<div>
  <pre>{JSON.stringify(query, null, 2)}</pre>
</div>
