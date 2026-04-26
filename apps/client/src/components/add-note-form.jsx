const inlineFieldStyles = { display: "flex", gap: 4 };

export function AddNoteForm({ onSubmit }) {
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        const result = await onSubmit({
          content: formData.get("content"),
        });
        if (result.success) {
          form.reset();
        }
      }}
    >
      <div style={inlineFieldStyles}>
        <input type="text" name="content" required aria-label="Note" />
        <button type="submit">Save</button>
      </div>
    </form>
  );
}
