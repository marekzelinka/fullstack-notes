import { uptime } from "node:process";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

import { env } from "./core/config.js";
import { tokenExtractor, userExtractor, unknownEndpoint, errorHandler } from "./core/middleware.js";
import { loginRouter } from "./routers/login.js";
import { notesRouter } from "./routers/notes.js";
import { usersRouter } from "./routers/users.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev", { skip: () => env.NODE_ENV === "test" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/api/health", async (_req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const isDbConnected = dbStatus === mongoose.ConnectionStates.connected;

  const healthInfo = {
    status: "ok",
    uptime: `${Math.floor(uptime())}s`,
    timestamp: new Date().toISOString(),
    services: {
      database: isDbConnected ? "healthy" : "unhealthy",
    },
  };

  try {
    if (!isDbConnected) {
      throw new Error("Database not connected");
    }

    // Run the admin ping command to verify the DB is responsive
    await mongoose.connection.db.admin().ping();

    res.status(200).json(healthInfo);
  } catch (error) {
    healthInfo.status = "error";
    healthInfo.services.database = "unhealthy";
    healthInfo.error = error.message;

    // Return 503 Service Unavailable so Fly.io knows the instance is failing
    res.status(503).json(healthInfo);
  }
});

app.use(tokenExtractor);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/notes", userExtractor, notesRouter);
app.use("/api/*splat", unknownEndpoint);

app.get("/*splat", (_req, res) => {
  res.sendFile("public/index.html", { root: "." });
});

app.use(errorHandler);
