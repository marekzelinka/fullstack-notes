import mongoose from "mongoose";

import { app } from "./app.js";
import { env } from "./core/config.js";

try {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.MONGODB_URI, {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
    family: 4,
  });
  console.log("Connected to MongoDB");

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
} catch (error) {
  console.error("Database connection failed:", error.message);
}
