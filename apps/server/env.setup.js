import { loadEnvFile } from "node:process";

// Only try to load the file if it exists locally
try {
  loadEnvFile("./apps/server/.env.local");
} catch {
  // Silence error in CI where file doesn't exist
}
