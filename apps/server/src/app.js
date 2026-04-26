import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { middleware } from "./core/middleware.js";
import { notesRouter } from "./routers/notes.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/api/health", (_req, res) =>
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  }),
);

app.use("/api/notes", notesRouter);
app.use("/api/*splat", middleware.unknownEndpoint);

app.get("/*splat", (_req, res) => {
  res.sendFile("public/index.html", { root: "." });
});

app.use(middleware._MUST_BE_LAST_errorHandler);
