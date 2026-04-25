import { useState, useReducer } from "react";

import { AddNoteForm } from "./components/add-note-form.jsx";
import { NoteFilters } from "./components/note-filters.jsx";
import { NoteList } from "./components/note-list.jsx";

export function App({ notes: initialNotes }) {
  const [notes, setNotes] = useState(initialNotes);

  const addNote = ({ content }) => {
    const newObject = {
      content,
      important: Math.random() < 0.5,
      id: notes.length + 1,
    };

    setNotes((notes) => notes.concat(newObject));

    return { success: true };
  };

  const [showAll, toggleShowAll] = useReducer((showAll) => !showAll, true);

  return (
    <>
      <h1>Fullstack Notes</h1>
      <aside>
        <NoteFilters showAll={showAll} toggleShowAll={toggleShowAll} />
      </aside>
      <NoteList notes={notes} showAll={showAll} />
      <AddNoteForm onSubmit={addNote} />
    </>
  );
}
