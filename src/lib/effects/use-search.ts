import { goto } from "$app/navigation";
import { effect, state } from "svelte";

type RunSearchParams<T> = {
  search: string;
  sort: T;
  page: number;
};

type DebouncedSearchOptions<T> = {
  delay?: number;
  requestFn: (params: RunSearchParams<T>, signal?: AbortSignal) => Promise<any>;
  serializeSort?: (sort: T) => Record<string, string>;
};

/**
 * A hook for debounced search functionality with URL synchronization.
 *
 * @param delay - The delay in milliseconds before the search is executed.
 * @param requestFn - The function to call when the search is executed.
 * @param serializeSort - The function to serialize the sort parameters for URL encoding.
 *
 * @returns The search hook with reactive state and control functions.
 *
 * @example
 * ```ts
 * <script lang="ts">
 *   import { useSearch } from "$lib/use-search";
 *   import { $props } from "svelte";
 *
 *   let { query, sort, page, contracts } = $props();
 *
 *   const {
 *     search,
 *     sort: sortState,
 *     page: pageState,
 *     searchResults,
 *     updateQuery,
 *     updateSort,
 *     updatePage,
 *     setNavigationIntent,
 *     navigated,
 *     lastLoadedQuery
 *   } = useSearch({
 *     delay: 100,
 *     requestFn: async ({ search, sort, page }) => {
 *       // Your actual fetch logic here
 *       return await fetchContracts(search, sort, page);
 *     },
 *     serializeSort: (sort) => ({
 *       sortField: sort.field,
 *       sortDirection: sort.direction
 *     })
 *   });
 *
 *   $effect(() => {
 *     if (navigated()) {
 *       updateQuery(query);
 *       updateSort(sort);
 *       updatePage(page);
 *       searchResults.set(contracts);
 *       lastLoadedQuery.set(query);
 *       navigated.set(false);
 *     }
 *   });
 *
 *   function handleLogoClick() {
 *     setNavigationIntent();
 *     goto("/", { replaceState: false });
 *   }
 * </script>
 * ```
 */
export const useSearch = <T>({
  delay = 100,
  requestFn,
  serializeSort = (sort: T) => (typeof sort === "object" ? (sort as Record<string, string>) : {})
}: DebouncedSearchOptions<T>) => {
  const search = state("");
  const sort = state<T | null>(null);
  const page = state(1);

  const searchResults = state<any>(null);
  const lastLoadedQuery = state("");
  const navigated = state(false);

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;

  const updateQuery = (q: string) => search.set(q);
  const updateSort = (s: T) => sort.set(s);
  const updatePage = (p: number) => page.set(p);
  const setNavigationIntent = () => navigated.set(true);

  const runSearch = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const q = search();
      const s = sort();
      const p = page();

      const params = new URLSearchParams();
      if (q) params.set("query", q);
      if (p) params.set("page", String(p));

      const sortParams = serializeSort(s!);
      for (const [key, value] of Object.entries(sortParams)) {
        params.set(key, value);
      }

      await goto(`?${params.toString()}`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true
      });

      if (controller) controller.abort();
      controller = new AbortController();

      try {
        const data = await requestFn({ search: q, sort: s!, page: p }, controller.signal);
        if (search() === q) {
          searchResults.set(data);
          lastLoadedQuery.set(q);
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    }, delay);
  };

  effect(runSearch);

  return {
    search,
    sort,
    page,
    searchResults,
    lastLoadedQuery,
    navigated,
    updateQuery,
    updateSort,
    updatePage,
    setNavigationIntent
  };
};
