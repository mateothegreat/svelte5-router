<script lang="ts">
  import { route } from "@mateothegreat/svelte5-router";
  import { Activity, PiggyBank, Send, Wallet } from "lucide-svelte";
  import { fade } from "svelte/transition";

  // Fake user data
  const userData = {
    name: "Svelte Boss",
    lastLogin: new Date().toLocaleString(),
    quickStats: [
      { title: "Total Balance", amount: "$45,250.80", icon: Wallet },
      { title: "Monthly Savings", amount: "$2,450.00", icon: PiggyBank },
      { title: "Recent Activity", count: "12 transactions", icon: Activity }
    ]
  };
</script>

<div
  class="p-6"
  in:fade={{ duration: 300 }}>
  <div class="mb-6">
    <h1 class="text-2xl text-gray-400">
      Welcome back,
      <span class="text-indigo-400 font-bold">{userData.name}</span>
    </h1>
    <p class="text-gray-400">Last login: {userData.lastLogin}</p>
  </div>

  <div class="grid gap-6 md:grid-cols-3">
    {#each userData.quickStats as stat}
      <div class="rounded-xl bg-slate-700/30 p-6 shadow-lg transition-transform hover:scale-[1.02]">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svelte:component
            this={stat.icon}
            class="h-6 w-6 text-blue-600" />
        </div>
        <h3 class="text-lg text-gray-400">{stat.title}</h3>
        <p class="mt-1 text-xl font-bold text-green-400">{stat.amount || stat.count}</p>
      </div>
    {/each}
  </div>

  <div class="mt-8">
    <a
      use:route
      href="/protected/manage-account/balance"
      class="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-700">
      <Send class="h-5 w-5" />
      View Balance
    </a>
  </div>
</div>
