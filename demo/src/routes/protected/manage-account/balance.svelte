<script lang="ts">
  import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-svelte";
  import { fade } from "svelte/transition";

  // Fake account data
  const accountBalance = 12543.67;
  const transactions = [
    { id: 1, type: "credit", amount: 2500.0, description: "Salary Deposit", date: "2024-03-15" },
    { id: 2, type: "debit", amount: 85.5, description: "Grocery Store", date: "2024-03-14" },
    { id: 3, type: "debit", amount: 125.0, description: "Electric Bill", date: "2024-03-13" },
    { id: 4, type: "credit", amount: 500.0, description: "Freelance Payment", date: "2024-03-12" },
    { id: 5, type: "debit", amount: 45.99, description: "Online Shopping", date: "2024-03-11" }
  ];
</script>

<div
  class="p-6"
  in:fade={{ duration: 300 }}>
  <div class="mb-8 rounded-xl bg-blue-600 p-8 text-white shadow-lg">
    <h2 class="mb-2 text-xl">Current Balance</h2>
    <div class="flex items-center gap-2">
      <DollarSign size={32} />
      <span class="text-4xl font-bold">{accountBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
    </div>
  </div>

  <div class="rounded-xl bg-white p-6 shadow-lg">
    <h3 class="mb-4 text-xl font-semibold text-gray-800">Recent Transactions</h3>
    <div class="space-y-4">
      {#each transactions as transaction}
        <div class="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
          <div class="flex items-center gap-3">
            {#if transaction.type === "credit"}
              <div class="rounded-full bg-green-100 p-2">
                <ArrowUpRight class="h-5 w-5 text-green-600" />
              </div>
            {:else}
              <div class="rounded-full bg-red-100 p-2">
                <ArrowDownRight class="h-5 w-5 text-red-600" />
              </div>
            {/if}
            <div>
              <p class="font-medium text-gray-800">{transaction.description}</p>
              <p class="text-sm text-gray-500">{transaction.date}</p>
            </div>
          </div>
          <span class={transaction.type === "credit" ? "text-green-600" : "text-red-600"}>
            {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>
