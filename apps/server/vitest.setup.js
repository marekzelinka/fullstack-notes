import { afterAll, beforeAll, beforeEach } from "vitest";

import { clearCollections, connectToDatabase, disconnectFromDatabase } from "./src/core/db.js";

beforeAll(async () => {
  await connectToDatabase();
});

afterAll(async () => {
  await disconnectFromDatabase();
});

beforeEach(async () => {
  await clearCollections();
});
