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

  const addNote = ({ content }) => {
    const newObject = {
      content,
      important: Math.random() < 0.5,
      id: String(notes.length + 1),
    };

    setNotes((notes) => notes.concat(newObject));

    return { success: true };
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
        <NoteList notes={notes} showAll={showAll} />
        <AddNoteForm onSubmit={addNote} />
      </main>
    </>
  );
}
