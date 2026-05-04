import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { NoteList } from "./note-list.jsx";

const MOCK_NOTES = [
  { id: "2ae1ffd0-0d9e-4a99-88aa-3bca58a74e20", content: "Important Note", important: true },
  { id: "73715f6c-dc07-4b05-b782-18478d6b6a65", content: "Casual Note", important: false },
];

test("renders all notes when showAll is true", async () => {
  const screen = await render(
    <NoteList notes={MOCK_NOTES} showAll={true} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByText(MOCK_NOTES[0].content)).toBeVisible();
  await expect.element(screen.getByText(MOCK_NOTES[1].content)).toBeVisible();
});

test("renders only important notes when showAll is false", async () => {
  const screen = await render(
    <NoteList notes={MOCK_NOTES} showAll={false} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByText(MOCK_NOTES[0].content)).toBeVisible();
  await expect.element(screen.getByText(MOCK_NOTES[1].content)).not.toBeInTheDocument();
});

test("uses correct list semantics for accessibility", async () => {
  const screen = await render(
    <NoteList notes={MOCK_NOTES} showAll={true} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );

  // Verify the container is a list
  await expect.element(screen.getByRole("list")).toBeVisible();
  // Verify list items (li) are rendered
  expect(screen.getByRole("listitem")).toHaveLength(2);
});

test("passes event handlers correctly to child NoteCards", async () => {
  const onToggle = vi.fn();
  const onDelete = vi.fn();

  const screen = await render(
    <NoteList
      notes={[MOCK_NOTES[0]]}
      showAll={true}
      onImportanceToggle={onToggle}
      onDelete={onDelete}
    />,
  );

  const firstNote = screen.getByRole("list").getByRole("listitem").nth(0);

  // Click the toggle button inside the rendered NoteCard
  await firstNote.getByRole("button", { name: /toggle/i }).click();

  expect(onToggle).toHaveBeenCalledWith(MOCK_NOTES[0].id);

  // Click the delete button inside the rendered NoteCard
  await firstNote.getByRole("button", { name: /delete/i }).click();

  expect(onDelete).toHaveBeenCalledWith(MOCK_NOTES[0].id);
});
