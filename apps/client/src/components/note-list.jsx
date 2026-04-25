import { NoteCard } from "./note-card.jsx";

export function NoteList({ notes, showAll }) {
  const filteredNotes = showAll ? notes : notes.filter((note) => note.important);

  return (
    <ul>
      {filteredNotes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} />
        </li>
      ))}
    </ul>
  );
}
