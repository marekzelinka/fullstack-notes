export function NoteFilters({ showAll, toggleShowAll }) {
  return (
    <div>
      <button type="button" onClick={toggleShowAll}>
        Show {showAll ? "important" : "all"}
      </button>
    </div>
  );
}
