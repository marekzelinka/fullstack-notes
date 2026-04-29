import express from "express";

import * as middleware from "../core/middleware.js";
import { Note } from "../models/note.js";

export const notesRouter = express.Router();

notesRouter.post("/", middleware.userExtractor, async (req, res) => {
  const user = req.user;
  const { content, important } = req.body;

  const note = await Note.create({ content, important, owner: user._id });

  await user.updateOne({ $push: { notes: note._id } });

  res.status(201).json(note);
});

notesRouter.get("/", async (_req, res) => {
  const notes = await Note.find().populate("owner", { username: 1, name: 1 });

  res.json(notes);
});

notesRouter.get("/:noteId", async (req, res) => {
  const note = await Note.findById(req.params.noteId);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json(note);
});

notesRouter.patch("/:noteId", middleware.userExtractor, async (req, res) => {
  const user = req.user;
  const { content, important } = req.body;
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, owner: user._id },
    { content, important },
    { runValidators: true, returnDocument: "after" },
  );
  if (!note) {
    const exists = await Note.findById(noteId);
    if (!exists) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(403).json({ error: "Only the owner can update this note" });
  }

  res.json(note);
});

notesRouter.delete("/:noteId", middleware.userExtractor, async (req, res) => {
  const user = req.user;
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({ _id: noteId, owner: user._id });
  if (!note) {
    const exists = await Note.findById(noteId);
    if (!exists) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(403).json({ error: "Only the owner can delete this note" });
  }

  await user.updateOne({ $pull: { notes: note._id } });

  res.status(204).end();
});
