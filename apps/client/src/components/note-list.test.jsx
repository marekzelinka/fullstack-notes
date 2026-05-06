import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { NoteList } from "./note-list.jsx";

const MOCK_NOTES = [
  { id: "69f4d84da6568a97bd8d333a", content: "Important Note", important: true },
  { id: "69f8745eccd0d186f9be4704", content: "Casual Note", important: false },
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

test("handles empty notes array", async () => {
  const screen = await render(
    <NoteList notes={[]} showAll={false} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );

  const list = screen.getByRole("list");

  await expect.element(list).toBeEmptyDOMElement();
  await expect.element(list.getByRole("listitem")).toHaveLength(0);
  await expect.element(screen.getByText(MOCK_NOTES[0].content)).not.toBeInTheDocument();
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
  vi.spyOn(window, "confirm").mockImplementation(() => true);
  await firstNote.getByRole("button", { name: /delete/i }).click();

  expect(onDelete).toHaveBeenCalledWith(MOCK_NOTES[0].id);
});
