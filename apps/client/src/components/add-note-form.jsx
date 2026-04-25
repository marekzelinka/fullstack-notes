export function AddNoteForm({ onSubmit }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const content = formData.get("content");

        const result = onSubmit({ content });
        if (result.success) {
          form.reset();
        }
      }}
    >
      <input type="text" name="content" required />
      <button type="submit">Save</button>
    </form>
  );
}
