export function NoteFilters({ showAll, toggleShowAll }) {
  return (
    <div role="group" style={{ display: "flex", gap: 4 }} aria-label="Note filter options">
      <button type="button" onClick={toggleShowAll}>
        Show {showAll ? "important" : "all"}
      </button>
    </div>
  );
}
