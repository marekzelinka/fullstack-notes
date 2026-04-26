import { useState, useReducer } from "react";
import { useEffect } from "react";

import { AddNoteForm } from "./components/add-note-form.jsx";
import { NoteFilters } from "./components/note-filters.jsx";
import { NoteList } from "./components/note-list.jsx";
import { notesApi } from "./lib/api.js";

export function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    notesApi.getAll().then(setNotes);
  }, []);

  const addNote = async ({ content }) => {
    const noteObject = {
      content,
      important: Math.random() < 0.5,
    };

    const createdNote = await notesApi.create(noteObject);
    setNotes((notes) => notes.concat(createdNote));

    return { success: true };
  };

  const toggleNoteImportance = async (id) => {
    const existingNote = notes.find((note) => note.id === id);
    const noteObject = { ...existingNote, important: !existingNote.important };

    try {
      const updatedNote = await notesApi.update(id, noteObject);
      setNotes((notes) => notes.map((note) => (note.id === id ? updatedNote : note)));
    } catch {
      window.alert(`Note "${existingNote.content}" was already deleted from server`);

      setNotes((notes) => notes.filter((note) => note.id !== id));
    }
  };

  const [showAll, toggleShowAll] = useReducer((showAll) => !showAll, true);

  return (
    <>
      <header>
        <h1>Fullstack Notes</h1>
      </header>
      <aside>
        <NoteFilters showAll={showAll} toggleShowAll={toggleShowAll} />
      </aside>
      <main>
        <NoteList notes={notes} showAll={showAll} onNoteImportanceToggle={toggleNoteImportance} />
        <AddNoteForm onSubmit={addNote} />
      </main>
    </>
  );
}
