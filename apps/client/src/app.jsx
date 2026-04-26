import { useState, useReducer } from "react";

import { AddNoteForm } from "./components/add-note-form.jsx";
import { NoteFilters } from "./components/note-filters.jsx";
import { NoteList } from "./components/note-list.jsx";

export function App() {
  const [notes, setNotes] = useState([
    // {
    //   id: 1,
    //   content: "HTML is easy",
    //   important: true,
    // },
    // {
    //   id: 2,
    //   content: "Browser can execute only JavaScript",
    //   important: false,
    // },
    // {
    //   id: 3,
    //   content: "GET and POST are the most important methods of HTTP protocol",
    //   important: true,
    // },
  ]);

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
