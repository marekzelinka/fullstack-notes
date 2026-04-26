import { useState, useReducer, useEffect, useRef } from "react";

import { AddNoteForm } from "./components/add-note-form.jsx";
import { Alert } from "./components/alert.jsx";
import { Footer } from "./components/footer.jsx";
import { NoteFilters } from "./components/note-filters.jsx";
import { NoteList } from "./components/note-list.jsx";
import { notesApi } from "./lib/api.js";

export function App() {
  const [alert, setAlert] = useState(null);
  const alertTimeoutIdRef = useRef();

  const notify = (message, { variant = "success" } = {}) => {
    if (alertTimeoutIdRef.current) {
      clearTimeout(alertTimeoutIdRef.current);
    }

    setAlert({ variant, message });
    const timeoutId = setTimeout(() => setAlert(null), 3500);

    alertTimeoutIdRef.current = timeoutId;
  };

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    notesApi.getAll().then(setNotes);
  }, []);

  const addNote = async ({ content }) => {
    const noteObject = {
      content,
    };

    const createdNote = await notesApi.create(noteObject);
    setNotes((prevNotes) => prevNotes.concat(createdNote));

    notify(`Added "${content}"`);

    return { success: true };
  };

  const toggleNoteImportance = async (id) => {
    const existingNote = notes.find((note) => note.id === id);
    const noteObject = { important: !existingNote.important };

    try {
      const updatedNote = await notesApi.update(id, noteObject);
      setNotes((prevNotes) => prevNotes.map((note) => (note.id === id ? updatedNote : note)));
    } catch {
      notify(`Note "${existingNote.content}" was already deleted from server`, {
        variant: "error",
      });

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }
  };

  const deleteNote = async (id) => {
    const existingNote = notes.find((note) => note.id === id);

    try {
      await notesApi.delete(id);

      notify(`Deleted "${existingNote.content}"`, { variant: "info" });
    } catch {
      notify(`Note "${existingNote.content}" was already removed from server`, {
        variant: "error",
      });
    } finally {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }
  };

  const [showAll, toggleShowAll] = useReducer((prevShowAll) => !prevShowAll, true);

  return (
    <>
      <header>
        <h1>Fullstack Notes</h1>
        {alert ? <Alert {...alert} /> : null}
      </header>
      <aside>
        <NoteFilters showAll={showAll} toggleShowAll={toggleShowAll} />
      </aside>
      <main>
        <NoteList
          notes={notes}
          showAll={showAll}
          onImportanceToggle={toggleNoteImportance}
          onDelete={deleteNote}
        />
        <AddNoteForm onSubmit={addNote} />
      </main>
      <Footer />
    </>
  );
}
