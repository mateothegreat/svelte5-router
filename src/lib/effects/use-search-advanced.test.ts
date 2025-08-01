import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSearch, type SearchResult } from "./use-search-advanced";

type TestData = {
  items: string[];
  total: number;
};

type TestSort = {
  field: "name" | "date";
  direction: "asc" | "desc";
};

const createMockRequestFn = (mockResponse: SearchResult<TestData>, delay = 0) => {
  return vi.fn().mockImplementation(async (params, signal) => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (signal.aborted) {
      throw new Error("AbortError");
    }

    return mockResponse;
  });
};

const createErrorRequestFn = (errorMessage: string) => {
  return vi.fn().mockRejectedValue(new Error(errorMessage));
};

describe("useSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn
      });

      expect(searchHook.query()).toBe("");
      expect(searchHook.sort()).toBeNull();
      expect(searchHook.page()).toBe(1);
      expect(searchHook.searchState()).toBe("idle");
      expect(searchHook.searchResults()).toBeNull();
      expect(searchHook.searchError()).toBeNull();
      expect(searchHook.isLoading()).toBe(false);
      expect(searchHook.lastSuccessfulQuery()).toBe("");
    });

    it("should initialize with provided initial values", () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });
      const initialSort: TestSort = { field: "name", direction: "asc" };

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        initialQuery: "test query",
        initialSort,
        initialPage: 2,
        debounceMs: 500
      });

      expect(searchHook.query()).toBe("test query");
      expect(searchHook.sort()).toEqual(initialSort);
      expect(searchHook.page()).toBe(2);
    });
  });

  describe("state management", () => {
    it("should update query and reset page to 1", async () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });
      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        initialSort: { field: "name", direction: "asc" },
        initialPage: 3
      });

      searchHook.setQuery("new query");

      expect(searchHook.query()).toBe("new query");
      expect(searchHook.page()).toBe(1); // Should reset to page 1
    });

    it("should update sort and reset page to 1", () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });
      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        initialSort: { field: "name", direction: "asc" },
        initialPage: 3
      });

      const newSort: TestSort = { field: "date", direction: "desc" };
      searchHook.setSort(newSort);

      expect(searchHook.sort()).toEqual(newSort);
      expect(searchHook.page()).toBe(1); // Should reset to page 1
    });

    it("should update page number (but not below 1)", () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });
      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        initialSort: { field: "name", direction: "asc" }
      });

      searchHook.setPage(5);
      expect(searchHook.page()).toBe(5);

      // Should not allow page < 1
      searchHook.setPage(0);
      expect(searchHook.page()).toBe(5); // Should remain unchanged

      searchHook.setPage(-1);
      expect(searchHook.page()).toBe(5); // Should remain unchanged
    });

    it("should reset all state to initial values", () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });
      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        initialQuery: "initial",
        initialSort: { field: "name", direction: "asc" },
        initialPage: 1
      });

      // Change state
      searchHook.setQuery("changed");
      searchHook.setSort({ field: "date", direction: "desc" });
      searchHook.setPage(3);

      // Reset
      searchHook.reset();

      expect(searchHook.query()).toBe("initial");
      expect(searchHook.sort()).toEqual({ field: "name", direction: "asc" });
      expect(searchHook.page()).toBe(1);
      expect(searchHook.searchResults()).toBeNull();
      expect(searchHook.searchError()).toBeNull();
      expect(searchHook.searchState()).toBe("idle");
    });
  });

  describe("search execution", () => {
    it("should execute search with debouncing", async () => {
      const mockResponse: SearchResult<TestData> = {
        data: { items: ["item1", "item2"], total: 2 }
      };
      const mockRequestFn = createMockRequestFn(mockResponse);

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 100,
        initialSort: { field: "name", direction: "asc" }
      });

      searchHook.setQuery("test");

      // Should not call immediately due to debouncing
      expect(mockRequestFn).not.toHaveBeenCalled();

      // Fast-forward past debounce delay
      vi.advanceTimersByTime(100);
      await vi.runAllTimersAsync();

      expect(mockRequestFn).toHaveBeenCalledWith(
        {
          query: "test",
          sort: { field: "name", direction: "asc" },
          page: 1
        },
        expect.any(AbortSignal)
      );

      expect(searchHook.searchResults()).toEqual(mockResponse.data);
      expect(searchHook.searchState()).toBe("success");
      expect(searchHook.lastSuccessfulQuery()).toBe("test");
    });

    it("should handle multiple rapid queries with proper debouncing", async () => {
      const mockResponse: SearchResult<TestData> = {
        data: { items: ["final"], total: 1 }
      };
      const mockRequestFn = createMockRequestFn(mockResponse);

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 100,
        initialSort: { field: "name", direction: "asc" }
      });

      // Rapid fire queries
      searchHook.setQuery("a");
      vi.advanceTimersByTime(50);

      searchHook.setQuery("ab");
      vi.advanceTimersByTime(50);

      searchHook.setQuery("abc");
      vi.advanceTimersByTime(50);

      searchHook.setQuery("final");

      // Complete the debounce
      vi.advanceTimersByTime(100);
      await vi.runAllTimersAsync();

      // Should only call once with the final query
      expect(mockRequestFn).toHaveBeenCalledTimes(1);
      expect(mockRequestFn).toHaveBeenCalledWith(
        {
          query: "final",
          sort: { field: "name", direction: "asc" },
          page: 1
        },
        expect.any(AbortSignal)
      );
    });

    it("should not execute search when sort is null", async () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 50
        // No initial sort provided
      });

      searchHook.setQuery("test");

      vi.advanceTimersByTime(50);
      await vi.runAllTimersAsync();

      expect(mockRequestFn).not.toHaveBeenCalled();
      expect(searchHook.searchState()).toBe("idle");
    });

    it("should handle search errors gracefully", async () => {
      const errorMessage = "Network error";
      const mockRequestFn = createErrorRequestFn(errorMessage);

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 50,
        initialSort: { field: "name", direction: "asc" }
      });

      searchHook.setQuery("test");

      vi.advanceTimersByTime(50);
      await vi.runAllTimersAsync();

      expect(searchHook.searchState()).toBe("error");
      expect(searchHook.searchError()).toBe(errorMessage);
      expect(searchHook.searchResults()).toBeNull();
    });

    it("should show loading state during request", async () => {
      const mockResponse: SearchResult<TestData> = {
        data: { items: ["item1"], total: 1 }
      };
      const mockRequestFn = createMockRequestFn(mockResponse, 100);

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 50,
        initialSort: { field: "name", direction: "asc" }
      });

      searchHook.setQuery("test");

      // Complete debounce
      vi.advanceTimersByTime(50);

      // Should be loading now
      expect(searchHook.isLoading()).toBe(true);
      expect(searchHook.searchState()).toBe("loading");

      // Complete the request
      vi.advanceTimersByTime(100);
      await vi.runAllTimersAsync();

      expect(searchHook.isLoading()).toBe(false);
      expect(searchHook.searchState()).toBe("success");
    });
  });

  describe("request cancellation", () => {
    it("should cancel previous request when new search starts", async () => {
      const mockRequestFn = vi.fn().mockImplementation(async (params, signal) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (signal.aborted) {
          throw new Error("AbortError");
        }
        return { data: { items: [`result-${params.query}`], total: 1 } };
      });

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 50,
        initialSort: { field: "name", direction: "asc" }
      });

      // Start first search
      searchHook.setQuery("first");
      vi.advanceTimersByTime(50);

      // Start second search before first completes
      searchHook.setQuery("second");
      vi.advanceTimersByTime(50);

      // Complete all timers
      await vi.runAllTimersAsync();

      // Should have made two calls but only the second should affect state
      expect(mockRequestFn).toHaveBeenCalledTimes(2);
      expect(searchHook.searchResults()).toEqual({
        items: ["result-second"],
        total: 1
      });
    });

    it("should allow manual cancellation", () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 100,
        initialSort: { field: "name", direction: "asc" }
      });

      searchHook.setQuery("test");

      // Cancel before debounce completes
      searchHook.cancelSearch();

      vi.advanceTimersByTime(100);

      expect(mockRequestFn).not.toHaveBeenCalled();
    });
  });

  describe("navigation state management", () => {
    it("should set navigation state correctly", () => {
      const mockRequestFn = createMockRequestFn({ data: { items: [], total: 0 } });

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn
      });

      const navData: TestData = { items: ["nav1", "nav2"], total: 2 };
      const navSort: TestSort = { field: "date", direction: "desc" };

      searchHook.setNavigationState("nav query", navSort, 3, navData);

      expect(searchHook.query()).toBe("nav query");
      expect(searchHook.sort()).toEqual(navSort);
      expect(searchHook.page()).toBe(3);
      expect(searchHook.searchResults()).toEqual(navData);
      expect(searchHook.searchState()).toBe("success");
      expect(searchHook.lastSuccessfulQuery()).toBe("nav query");
      expect(searchHook.searchError()).toBeNull();
    });
  });

  describe("sort serialization", () => {
    it("should use custom serializeSort function", async () => {
      const mockResponse: SearchResult<TestData> = {
        data: { items: [], total: 0 }
      };
      const mockRequestFn = createMockRequestFn(mockResponse);

      const customSerializeSort = vi.fn().mockReturnValue({
        sortField: "name",
        sortDir: "asc"
      });

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        serializeSort: customSerializeSort,
        debounceMs: 50,
        initialSort: { field: "name", direction: "asc" }
      });

      searchHook.setQuery("test");

      vi.advanceTimersByTime(50);
      await vi.runAllTimersAsync();

      expect(customSerializeSort).toHaveBeenCalledWith({
        field: "name",
        direction: "asc"
      });
    });

    it("should handle default serialization for object sort", async () => {
      // This tests the defaultSerializeSort function internally
      const mockResponse: SearchResult<TestData> = {
        data: { items: [], total: 0 }
      };
      const mockRequestFn = createMockRequestFn(mockResponse);

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 50,
        syncWithUrl: false, // Disable URL sync to avoid goto calls in tests
        initialSort: { field: "name", direction: "asc" }
      });

      searchHook.setQuery("test");

      vi.advanceTimersByTime(50);
      await vi.runAllTimersAsync();

      // The request should still be made even with default serialization
      expect(mockRequestFn).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty query", async () => {
      const mockResponse: SearchResult<TestData> = {
        data: { items: [], total: 0 }
      };
      const mockRequestFn = createMockRequestFn(mockResponse);

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 50,
        initialSort: { field: "name", direction: "asc" }
      });

      searchHook.setQuery("");

      vi.advanceTimersByTime(50);
      await vi.runAllTimersAsync();

      expect(mockRequestFn).toHaveBeenCalledWith(
        {
          query: "",
          sort: { field: "name", direction: "asc" },
          page: 1
        },
        expect.any(AbortSignal)
      );
    });

    it("should handle race conditions correctly", async () => {
      const mockRequestFn = vi.fn();

      // Mock different responses for different queries
      mockRequestFn
        .mockResolvedValueOnce({
          data: { items: ["slow-result"], total: 1 }
        })
        .mockResolvedValueOnce({
          data: { items: ["fast-result"], total: 1 }
        });

      const searchHook = useSearch<TestData, TestSort>({
        requestFn: mockRequestFn,
        debounceMs: 50,
        initialSort: { field: "name", direction: "asc" }
      });

      // Start slow search
      searchHook.setQuery("slow");
      vi.advanceTimersByTime(50);

      // Immediately start fast search
      searchHook.setQuery("fast");
      vi.advanceTimersByTime(50);

      await vi.runAllTimersAsync();

      // Should only show results from the latest query
      expect(searchHook.searchResults()).toEqual({
        items: ["fast-result"],
        total: 1
      });
      expect(searchHook.lastSuccessfulQuery()).toBe("fast");
    });
  });
});
