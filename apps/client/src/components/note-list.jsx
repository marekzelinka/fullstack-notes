import { NoteCard } from "./note-card.jsx";

const listStyles = { listStyle: "none", paddingLeft: 0 };

export function NoteList({ notes, showAll }) {
  const filteredNotes = showAll ? notes : notes.filter((note) => note.important);

  return (
    <ul role="list" style={listStyles}>
      {filteredNotes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} />
        </li>
      ))}
    </ul>
  );
}
