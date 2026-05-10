import express from "express";

import { Note } from "../models/note.js";

export const notesRouter = express.Router();

notesRouter.post("/", async (req, res) => {
  const user = req.user;
  const { content, important } = req.body;

  const note = await Note.create({ content, important, owner: user._id });

  await user.updateOne({ $push: { notes: note._id } });

  res.status(201).json(note);
});

notesRouter.get("/", async (req, res) => {
  const user = req.user;

  const notes = await Note.find({ owner: user._id });

  res.json(notes);
});

notesRouter.get("/:id", async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const note = await Note.findOne({ _id: id, owner: user._id });
  if (!note) {
    return res.status(404).json({ error: "Note not found or unauthorized" });
  }

  res.json(note);
});

notesRouter.patch("/:id", async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { content, important } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: id, owner: user._id },
    { content, important },
    { runValidators: true, returnDocument: "after" },
  );
  if (!note) {
    return res.status(404).json({ error: "Note not found or unauthorized" });
  }

  res.json(note);
});

notesRouter.delete("/:id", async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const note = await Note.findOneAndDelete({ _id: id, owner: user._id });
  if (!note) {
    return res.status(404).json({ error: "Note not found or unauthorized" });
  }

  await user.updateOne({ $pull: { notes: id } });

  res.status(204).end();
});
