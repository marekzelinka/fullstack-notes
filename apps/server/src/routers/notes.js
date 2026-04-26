import express from "express";

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

export const notesRouter = express.Router();

notesRouter.post("/", (req, res) => {
  const { content, important } = req.body;
  if (!content) {
    res.status(400).json({ detail: "Content is required" });

    return;
  }

  const note = {
    content,
    important: important ?? false,
    id: crypto.randomUUID(),
  };
  notes = notes.concat(note);

  res.status(201).json(note);
});

notesRouter.get("/", (_req, res) => {
  res.json(notes);
});

notesRouter.get("/:noteId", (req, res) => {
  const existingNote = notes.find((note) => note.id === req.params.noteId);
  if (!existingNote) {
    res.status(404).json({ detail: "Note not found" });

    return;
  }

  res.json(existingNote);
});

notesRouter.patch("/:noteId", (req, res) => {
  const { content, important } = req.body;

  const existingNote = notes.find((note) => note.id === req.params.noteId);
  if (!existingNote) {
    res.status(404).json({ detail: "Note not found" });

    return;
  }

  const updatedNote = {
    ...existingNote,
    content: content ?? existingNote.content,
    important: important ?? existingNote.important,
  };
  if (!updatedNote.content) {
    res.status(400).json({ detail: "Content is required" });

    return;
  }
  notes = notes.map((note) => (note.id === req.params.noteId ? updatedNote : note));

  res.json(updatedNote);
});

notesRouter.delete("/:noteId", (req, res) => {
  notes = notes.filter((note) => note.id !== req.params.noteId);

  res.status(204).end();
});
