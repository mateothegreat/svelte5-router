import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["json-summary"],
      reportsDirectory: "tmp/coverage"
    }
  }
});
