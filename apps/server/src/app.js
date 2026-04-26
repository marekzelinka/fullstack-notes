import express from "express";

import { notesRouter } from "./routers/notes.js";

export const app = express();

app.use(express.json());

app.use("/api/notes", notesRouter);
