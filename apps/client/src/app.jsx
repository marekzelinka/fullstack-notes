import { NoteCard } from "./components/note-card.jsx";

export function App({ notes }) {
  return (
    <>
      <h1>Fullstack Notes</h1>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <NoteCard note={note} />
          </li>
        ))}
      </ul>
    </>
  );
}
