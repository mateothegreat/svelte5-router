<script lang="ts">
  import { Router } from "@mateothegreat/svelte5-router";
  import BankAccount from "./bank-account.svelte";
</script>

<Router
  routes={[
    {
      path: "",
      component: BankAccount
    }
  ]} />
