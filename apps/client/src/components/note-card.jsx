export function NoteCard({ note, onImportanceToggle, onDelete }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div>{note.content}</div>
      <div role="group" style={{ display: "flex", gap: 4 }} aria-label="Note actions">
        <button type="button" onClick={() => onImportanceToggle(note.id)}>
          {note.important ? "Toggle not important" : "Toggle important"}
        </button>
        <button type="button" onClick={() => onDelete(note.id)} aria-label="Delete">
          ✖
        </button>
      </div>
    </div>
  );
}
