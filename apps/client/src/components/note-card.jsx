const noteCardStyles = { display: "flex", gap: 8 };

export function NoteCard({ note, onImportanceToggle }) {
  return (
    <div style={noteCardStyles}>
      <div>{note.content}</div>
      <div>
        <button type="button" onClick={() => onImportanceToggle(note.id)}>
          {note.important ? "Toggle not important" : "Toggle important"}
        </button>
      </div>
    </div>
  );
}
