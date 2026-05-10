import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "server",
    environment: "node",
    setupFiles: ["./vitest.setup.js"],
    env: {
      NODE_ENV: "test",
      SECRET_KEY: "test-secret-only-for-local-and-ci",
    },
  },
});
