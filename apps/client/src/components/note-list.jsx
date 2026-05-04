import { NoteCard } from "./note-card.jsx";

export function NoteList({ notes, showAll, onImportanceToggle, onDelete }) {
  const filteredNotes = showAll ? notes : notes.filter((note) => note.important);

  return (
    <ul role="list" style={{ listStyle: "none", paddingLeft: 0, display: "grid", gap: 6 }}>
      {filteredNotes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} onImportanceToggle={onImportanceToggle} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
