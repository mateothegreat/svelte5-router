<script lang="ts">
  import { goto } from "@mateothegreat/svelte5-router";
  import { Shield } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import { client } from "./account-state.svelte";
</script>

<div
  class="p-6"
  in:fade={{ duration: 300 }}>
  <div class="mx-auto max-w-md rounded-xl bg-white p-8 shadow-lg">
    <div class="mb-6 text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Shield class="h-8 w-8 text-blue-600" />
      </div>
      <h2 class="text-2xl font-bold text-gray-800">Secure Login</h2>
      <p class="mt-2 text-gray-600">Please log in to access your account</p>
    </div>

    <button
      class="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      on:click={() => {
        client.loggedIn = true;
        goto("/protected/manage-account");
      }}>
      Login to Your Account
    </button>
  </div>
</div>
