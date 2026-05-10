import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["apps/client", "apps/server"],
    exclude: ["apps/e2e"],
    coverage: {
      provider: "v8",
    },
  },
});
