import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "server",
    environment: "node",
    pool: "threads",
    maxWorkers: 1,
    setupFiles: ["./vitest.setup.js"],
    env: {
      NODE_ENV: "test",
      SECRET_KEY: "test-secret-only-for-local-and-ci",
    },
  },
});
