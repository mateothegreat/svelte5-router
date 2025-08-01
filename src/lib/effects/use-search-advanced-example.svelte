<!-- SearchPage.svelte -->
<script lang="ts">
  import { page } from "$app/state";
  import { effect } from "svelte";
  import { useSearch, type SearchResult } from "./use-search-advanced";

  type Contract = {
    id: string;
    title: string;
    value: number;
    date: string;
    status: "active" | "pending" | "completed";
    tags: string[];
  };

  type ContractSort = {
    field: "title" | "value" | "date" | "status";
    direction: "asc" | "desc";
  };

  type ContractFilters = {
    status?: "active" | "pending" | "completed";
    minValue?: number;
    maxValue?: number;
    tags?: string[];
  };

  type Props = {
    initialQuery: string;
    initialSort: ContractSort;
    initialPage: number;
    initialContracts: Contract[];
    initialFilters: ContractFilters;
  };

  let {
    initialQuery = "",
    initialSort = { field: "date", direction: "desc" },
    initialPage = 1,
    initialContracts = [],
    initialFilters = {}
  }: Props = $props();

  const searchHook = useSearch<Contract[], ContractSort>({
    debounceMs: 300,
    initialQuery,
    initialSort,
    initialPage,
    syncWithUrl: true,

    requestFn: async ({ query, sort, page }, signal): Promise<SearchResult<Contract[]>> => {
      // Build query parameters
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        limit: "20",
        sortField: sort.field,
        sortDirection: sort.direction,
        // Add filters
        ...(initialFilters.status && { status: initialFilters.status }),
        ...(initialFilters.minValue && { minValue: String(initialFilters.minValue) }),
        ...(initialFilters.maxValue && { maxValue: String(initialFilters.maxValue) }),
        ...(initialFilters.tags && { tags: initialFilters.tags.join(",") })
      });

      try {
        const response = await fetch(`/api/contracts?${params}`, {
          signal,
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Too many requests. Please slow down and try again.");
          }
          if (response.status >= 500) {
            throw new Error("Server error. Please try again later.");
          }
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!data || !Array.isArray(data.contracts)) {
          throw new Error("Invalid response format from server");
        }

        return {
          data: data.contracts,
          totalCount: data.totalCount,
          hasNextPage: data.hasNextPage
        };
      } catch (error) {
        if (error instanceof Error) {
          // Re-throw with better context
          throw new Error(`Contract search failed: ${error.message}`);
        }
        throw new Error("An unexpected error occurred during search");
      }
    },

    serializeSort: (sort) => ({
      sortField: sort.field,
      sortDirection: sort.direction
    })
  });

  const {
    query,
    sort,
    page: currentPage,
    searchState,
    searchResults: contracts,
    searchError,
    isLoading,
    lastSuccessfulQuery,
    setQuery,
    setSort,
    setPage,
    executeSearch,
    cancelSearch,
    reset,
    setNavigationState
  } = searchHook;

  // Handle back/forward navigation
  effect(() => {
    const urlParams = $page.url.searchParams;
    const urlQuery = urlParams.get("query") || "";
    const urlPage = parseInt(urlParams.get("page") || "1", 10);
    const urlSortField = (urlParams.get("sortField") as ContractSort["field"]) || "date";
    const urlSortDirection = (urlParams.get("sortDirection") as ContractSort["direction"]) || "desc";

    const urlSort: ContractSort = {
      field: urlSortField,
      direction: urlSortDirection
    };

    // Check if we navigated here with existing data (e.g., from another page)
    if (
      initialContracts.length > 0 &&
      urlQuery === initialQuery &&
      urlPage === initialPage &&
      urlSort.field === initialSort.field &&
      urlSort.direction === initialSort.direction
    ) {
      // Set state from initial props without triggering new search
      setNavigationState(urlQuery, urlSort, urlPage, initialContracts);
    }
  });

  const handleQueryInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setQuery(target.value);
  };

  const handleSortChange = (newSort: ContractSort) => {
    setSort(newSort);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleClearSearch = () => {
    reset();
  };

  const handleRetrySearch = () => {
    executeSearch();
  };

  const handleCancelSearch = () => {
    cancelSearch();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(dateString));
  };

  const getStatusBadgeClass = (status: Contract["status"]): string => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "active":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "completed":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Page Header -->
  <div class="md:flex md:items-center md:justify-between mb-8">
    <div class="min-w-0 flex-1">
      <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">Contract Search</h1>
      <p class="mt-1 text-sm text-gray-500">Find and filter contracts across your organization</p>
    </div>
  </div>

  <!-- Search Controls -->
  <div class="bg-white shadow rounded-lg mb-6">
    <div class="px-4 py-5 sm:p-6">
      <!-- Search Input -->
      <div class="mb-4">
        <label
          for="search-input"
          class="block text-sm font-medium text-gray-700 mb-2">
          Search Contracts
        </label>
        <div class="relative">
          <input
            id="search-input"
            type="text"
            value={query()}
            oninput={handleQueryInput}
            placeholder="Search by title, ID, or content..."
            class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading()}
            aria-describedby="search-help" />

          <!-- Search Icon -->
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Loading Spinner / Clear Button -->
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            {#if isLoading()}
              <svg
                class="animate-spin h-5 w-5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4">
                </circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
            {:else if query()}
              <button
                onclick={handleClearSearch}
                class="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                aria-label="Clear search">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        </div>

        <p
          id="search-help"
          class="mt-1 text-sm text-gray-500">
          {#if lastSuccessfulQuery()}
            Last search: "{lastSuccessfulQuery()}"
          {:else}
            Enter search terms to find contracts
          {/if}
        </p>
      </div>

      <!-- Sort Controls -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            for="sort-field"
            class="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort-field"
            value={sort()?.field || "date"}
            onchange={(e) =>
              handleSortChange({
                field: e.target.value as ContractSort["field"],
                direction: sort()?.direction || "desc"
              })}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isLoading()}>
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="value">Value</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div>
          <label
            for="sort-direction"
            class="block text-sm font-medium text-gray-700 mb-1">
            Direction
          </label>
          <select
            id="sort-direction"
            value={sort()?.direction || "desc"}
            onchange={(e) =>
              handleSortChange({
                field: sort()?.field || "date",
                direction: e.target.value as ContractSort["direction"]
              })}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isLoading()}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Search Results -->
  <div class="bg-white shadow rounded-lg">
    {#if searchError()}
      <!-- Error State -->
      <div class="px-4 py-12 sm:px-6 text-center">
        <div class="mx-auto h-12 w-12 text-red-400 mb-4">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            class="h-full w-full">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
        <p class="text-sm text-gray-500 mb-4">{searchError()}</p>
        <div class="flex justify-center space-x-3">
          <button
            onclick={handleRetrySearch}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg
              class="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Search
          </button>
          <button
            onclick={handleClearSearch}
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Clear Search
          </button>
        </div>
      </div>
    {:else if searchState() === "idle" || (contracts() && contracts().length === 0 && query())}
      <!-- Empty State -->
      <div class="px-4 py-12 sm:px-6 text-center">
        <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            class="h-full w-full">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {query() ? "No contracts found" : "Start searching"}
        </h3>
        <p class="text-sm text-gray-500">
          {query() ? `No contracts match your search for "${query()}"` : "Enter a search term above to find contracts"}
        </p>
      </div>
    {:else if contracts()}
      <!-- Results List -->
      <div class="divide-y divide-gray-200">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Search Results</h3>
            {#if isLoading()}
              <button
                onclick={handleCancelSearch}
                class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg
                  class="mr-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            {/if}
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {contracts().length} contract{contracts().length !== 1 ? "s" : ""} found
            {query() ? ` for "${query()}"` : ""}
          </p>
        </div>

        {#each contracts() as contract (contract.id)}
          <div class="px-4 py-6 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 mb-2">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {contract.title}
                  </h4>
                  <span class={getStatusBadgeClass(contract.status)}>
                    {contract.status}
                  </span>
                </div>

                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="flex items-center">
                    <svg
                      class="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {formatCurrency(contract.value)}
                  </span>

                  <span class="flex items-center">
                    <svg
                      class="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(contract.date)}
                  </span>
                </div>

                {#if contract.tags.length > 0}
                  <div class="mt-2 flex flex-wrap gap-1">
                    {#each contract.tags as tag}
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="ml-4 flex-shrink-0">
                <button
                  onclick={() => goto(`/contracts/${contract.id}`)}
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  View Details
                  <svg
                    class="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      {#if contracts() && contracts().length > 0}
        <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                onclick={() => handlePageChange(currentPage() - 1)}
                disabled={currentPage() <= 1 || isLoading()}
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button
                onclick={() => handlePageChange(currentPage() + 1)}
                disabled={isLoading()}
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>

            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Page <span class="font-medium">{currentPage()}</span>
                  {#if query()}
                    of search results for <span class="font-medium">"{query()}"</span>
                  {/if}
                </p>
              </div>

              <div class="flex space-x-2">
                <button
                  onclick={() => handlePageChange(currentPage() - 1)}
                  disabled={currentPage() <= 1 || isLoading()}
                  class="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg
                    class="mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <button
                  onclick={() => handlePageChange(currentPage() + 1)}
                  disabled={isLoading()}
                  class="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                  <svg
                    class="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
