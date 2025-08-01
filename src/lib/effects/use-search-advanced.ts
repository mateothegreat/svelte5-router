import { goto } from "$app/navigation";
import { effect, state } from "svelte";

/**
 * Represents the current state of a search operation
 */
export type SearchState = "idle" | "loading" | "success" | "error";

/**
 * Parameters passed to the search request function
 */
export type SearchParams<TSortConfig> = {
  readonly query: string;
  readonly sort: TSortConfig;
  readonly page: number;
};

/**
 * Result wrapper for search operations
 */
export type SearchResult<TData> = {
  readonly data: TData;
  readonly totalCount?: number;
  readonly hasNextPage?: boolean;
  readonly error?: string;
};

/**
 * Configuration for the search hook
 */
export type SearchHookConfig<TData, TSortConfig> = {
  /** Debounce delay in milliseconds (default: 300ms) */
  readonly debounceMs?: number;

  /** Function to execute the search request */
  readonly requestFn: (params: SearchParams<TSortConfig>, signal: AbortSignal) => Promise<SearchResult<TData>>;

  /** Function to serialize sort config for URL parameters */
  readonly serializeSort?: (sort: TSortConfig) => Record<string, string>;

  /** Initial search query */
  readonly initialQuery?: string;

  /** Initial sort configuration */
  readonly initialSort?: TSortConfig;

  /** Initial page number */
  readonly initialPage?: number;

  /** Whether to update URL on search changes */
  readonly syncWithUrl?: boolean;
};

/**
 * Return type of the search hook
 */
export type SearchHookReturn<TData, TSortConfig> = {
  // State getters
  readonly query: () => string;
  readonly sort: () => TSortConfig | null;
  readonly page: () => number;
  readonly searchState: () => SearchState;
  readonly searchResults: () => TData | null;
  readonly searchError: () => string | null;
  readonly isLoading: () => boolean;
  readonly lastSuccessfulQuery: () => string;

  // State setters
  readonly setQuery: (query: string) => void;
  readonly setSort: (sort: TSortConfig) => void;
  readonly setPage: (page: number) => void;
  readonly reset: () => void;

  // Actions
  readonly executeSearch: () => Promise<void>;
  readonly cancelSearch: () => void;

  // Navigation helpers
  readonly setNavigationState: (query: string, sort: TSortConfig, page: number, results: TData) => void;
};

/**
 * Default sort serializer that handles common object shapes
 */
const defaultSerializeSort = <T>(sort: T): Record<string, string> => {
  if (!sort || typeof sort !== "object") {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(sort as Record<string, unknown>)) {
    if (value !== null && value !== undefined) {
      result[key] = String(value);
    }
  }
  return result;
};

/**
 * Builds URL search parameters from search state
 */
const buildUrlParams = <TSortConfig>(
  query: string,
  page: number,
  sort: TSortConfig | null,
  serializeSort: (sort: TSortConfig) => Record<string, string>
): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("query", query);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  if (sort) {
    const sortParams = serializeSort(sort);
    for (const [key, value] of Object.entries(sortParams)) {
      if (value) {
        params.set(key, value);
      }
    }
  }

  return params;
};

/**
 * A comprehensive search hook with debouncing, URL synchronization, and robust state management.
 *
 * This hook provides:
 * - Debounced search execution
 * - Loading states and error handling
 * - URL synchronization (optional)
 * - Type-safe search parameters and results
 * - Request cancellation
 * - Navigation state management
 *
 * @example
 * ```typescript
 * type ContractSort = {
 *   field: 'date' | 'title' | 'value';
 *   direction: 'asc' | 'desc';
 * };
 *
 * type Contract = {
 *   id: string;
 *   title: string;
 *   date: string;
 *   value: number;
 * };
 *
 * const searchHook = useSearch<Contract[], ContractSort>({
 *   debounceMs: 300,
 *   requestFn: async ({ query, sort, page }, signal) => {
 *     const response = await fetch(`/api/contracts?q=${query}&page=${page}`, {
 *       signal
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error(`Search failed: ${response.statusText}`);
 *     }
 *
 *     const data = await response.json();
 *     return {
 *       data: data.contracts,
 *       totalCount: data.total,
 *       hasNextPage: data.hasMore
 *     };
 *   },
 *   serializeSort: (sort) => ({
 *     sortField: sort.field,
 *     sortDirection: sort.direction
 *   }),
 *   initialSort: { field: 'date', direction: 'desc' },
 *   syncWithUrl: true
 * });
 * ```
 */
export const useSearch = <TData, TSortConfig = Record<string, unknown>>(
  config: SearchHookConfig<TData, TSortConfig>
): SearchHookReturn<TData, TSortConfig> => {
  const {
    debounceMs = 300,
    requestFn,
    serializeSort = defaultSerializeSort,
    initialQuery = "",
    initialSort = null,
    initialPage = 1,
    syncWithUrl = true
  } = config;

  const query = state(initialQuery);
  const sort = state<TSortConfig | null>(initialSort);
  const page = state(initialPage);
  const searchState = state<SearchState>("idle");
  const searchResults = state<TData | null>(null);
  const searchError = state<string | null>(null);
  const lastSuccessfulQuery = state("");

  const isLoading = (): boolean => searchState() === "loading";

  let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentController: AbortController | null = null;

  /**
   * Clears any pending debounced search
   */
  const clearDebounce = (): void => {
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
      debounceTimeoutId = null;
    }
  };

  /**
   * Cancels any in-flight search request
   */
  const cancelCurrentRequest = (): void => {
    if (currentController) {
      currentController.abort();
      currentController = null;
    }
  };

  /**
   * Updates URL to reflect current search state
   */
  const updateUrl = async (): Promise<void> => {
    if (!syncWithUrl) return;

    try {
      const params = buildUrlParams(query(), page(), sort(), serializeSort);
      const urlString = params.toString();
      const newUrl = urlString ? `?${urlString}` : "";

      await goto(newUrl, {
        replaceState: true,
        noScroll: true,
        keepFocus: true
      });
    } catch (error) {
      console.warn("Failed to update URL:", error);
      // URL update failure shouldn't break search functionality
    }
  };

  /**
   * Executes the search request
   */
  const performSearch = async (): Promise<void> => {
    const currentQuery = query();
    const currentSort = sort();
    const currentPage = page();

    // Don't search without sort configuration
    if (!currentSort) {
      searchState.set("idle");
      return;
    }

    // Cancel previous request
    cancelCurrentRequest();

    // Clear any previous errors
    searchError.set(null);
    searchState.set("loading");

    // Create new abort controller
    currentController = new AbortController();

    try {
      const result = await requestFn(
        {
          query: currentQuery,
          sort: currentSort,
          page: currentPage
        },
        currentController.signal
      );

      // Only update state if this is still the current request
      // (prevents race conditions with rapid typing)
      if (query() === currentQuery && sort() === currentSort && page() === currentPage) {
        searchResults.set(result.data);
        lastSuccessfulQuery.set(currentQuery);
        searchState.set("success");

        // Update URL after successful search
        await updateUrl();
      }
    } catch (error) {
      // Only handle non-abort errors
      if (error instanceof Error && error.name !== "AbortError") {
        // Only set error if this is still the current request
        if (query() === currentQuery && sort() === currentSort && page() === currentPage) {
          searchError.set(error.message);
          searchState.set("error");
          console.error("Search request failed:", error);
        }
      }
    } finally {
      // Clean up controller reference
      if (currentController && !currentController.signal.aborted) {
        currentController = null;
      }
    }
  };

  /**
   * Debounced search execution
   */
  const executeSearchDebounced = (): void => {
    clearDebounce();

    debounceTimeoutId = setTimeout(() => {
      performSearch();
    }, debounceMs);
  };

  /**
   * Auto-execute search when query, sort, or page changes
   */
  effect(() => {
    // Track dependencies
    query();
    sort();
    page();

    executeSearchDebounced();
  });

  return {
    // State getters
    query: () => query(),
    sort: () => sort(),
    page: () => page(),
    searchState: () => searchState(),
    searchResults: () => searchResults(),
    searchError: () => searchError(),
    isLoading,
    lastSuccessfulQuery: () => lastSuccessfulQuery(),

    // State setters
    setQuery: (newQuery: string) => {
      query.set(newQuery);
      // Reset to first page when query changes
      if (page() !== 1) {
        page.set(1);
      }
    },

    setSort: (newSort: TSortConfig) => {
      sort.set(newSort);
      // Reset to first page when sort changes
      if (page() !== 1) {
        page.set(1);
      }
    },

    setPage: (newPage: number) => {
      if (newPage > 0) {
        page.set(newPage);
      }
    },

    reset: () => {
      cancelCurrentRequest();
      clearDebounce();
      query.set(initialQuery);
      sort.set(initialSort);
      page.set(initialPage);
      searchResults.set(null);
      searchError.set(null);
      searchState.set("idle");
      lastSuccessfulQuery.set("");
    },

    // Actions
    executeSearch: performSearch,

    cancelSearch: () => {
      cancelCurrentRequest();
      clearDebounce();
      if (searchState() === "loading") {
        searchState.set("idle");
      }
    },

    // Navigation helpers
    setNavigationState: (navQuery: string, navSort: TSortConfig, navPage: number, navResults: TData) => {
      // Cancel any pending operations
      cancelCurrentRequest();
      clearDebounce();

      // Set all state atomically
      query.set(navQuery);
      sort.set(navSort);
      page.set(navPage);
      searchResults.set(navResults);
      lastSuccessfulQuery.set(navQuery);
      searchState.set("success");
      searchError.set(null);
    }
  };
};
