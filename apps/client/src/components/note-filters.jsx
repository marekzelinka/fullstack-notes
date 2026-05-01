const rowStyles = { display: "flex", gap: 4 };

export function NoteFilters({ showAll, toggleShowAll }) {
  return (
    <div role="group" aria-label="Note filter options">
      <div style={rowStyles}>
        <button type="button" onClick={toggleShowAll}>
          Show {showAll ? "important" : "all"}
        </button>
      </div>
    </div>
  );
}
