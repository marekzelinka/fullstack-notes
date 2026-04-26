const noteCardStyles = { display: "flex", gap: 8 };
const noteCardActionStyles = { display: "flex", gap: 4 };

export function NoteCard({ note, onImportanceToggle, onDelete }) {
  return (
    <div style={noteCardStyles}>
      <div>{note.content}</div>
      <div role="group" style={noteCardActionStyles} aria-label="Note actions">
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
