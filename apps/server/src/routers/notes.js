import express from "express";

import { Note } from "../models/note.js";
import { User } from "../models/user.js";

export const notesRouter = express.Router();

notesRouter.post("/", async (req, res) => {
  const { content, important, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(400).json({ error: "userId missing" });

    return;
  }

  const note = await Note.create({ content, important, user: user._id });

  user.notes = user.notes.concat(note._id);
  await user.save();

  res.status(201).json(note);
});

notesRouter.get("/", async (_req, res) => {
  const notes = await Note.find().populate("user", { username: 1, name: 1 });

  res.json(notes);
});

notesRouter.get("/:noteId", async (req, res) => {
  const note = await Note.findById(req.params.noteId);
  if (!note) {
    res.status(404).json({ error: "Note not found" });

    return;
  }

  res.json(note);
});

notesRouter.patch("/:noteId", async (req, res) => {
  const { content, important } = req.body;

  const note = await Note.findByIdAndUpdate(
    req.params.noteId,
    { content, important },
    { runValidators: true, returnDocument: "after" },
  );
  if (!note) {
    res.status(404).json({ error: "Note not found" });

    return;
  }

  res.json(note);
});

notesRouter.delete("/:noteId", async (req, res) => {
  await Note.findByIdAndDelete(req.params.noteId);

  res.status(204).end();
});
