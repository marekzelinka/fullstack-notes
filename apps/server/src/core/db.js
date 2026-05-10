import mongoose from "mongoose";

import { env } from "./config.js";
import { logError, logInfo } from "./logger.js";

let mongodb;
const connectOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
  family: 4,
};

export async function connectToDatabase() {
  if (env.NODE_ENV === "test") {
    const { MongoMemoryServer } = await import("mongodb-memory-server");

    if (!mongodb) {
      mongodb = await MongoMemoryServer.create();
    }

    await mongoose.connect(mongodb.getUri(), connectOptions);

    logInfo("Connected to in-memory database");

    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI, connectOptions);

    logInfo("Connected to database");
  } catch (error) {
    logError("Error connecting to database", error);
  }
}

export async function disconnectFromDatabase() {
  if (env.NODE_ENV === "test") {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongodb) {
      await mongodb.stop();
    }
  }

  await mongoose.disconnect();

  logInfo("Disconnected from database");
}

export async function clearCollections() {
  if (env.NODE_ENV !== "test") {
    throw new Error("clearCollections can only be used in test environment");
  }

  const collections = mongoose.connection.collections;

  for (const key in collections) {
    // oxlint-disable-next-line no-await-in-loop
    await collections[key].deleteMany();
  }
}
