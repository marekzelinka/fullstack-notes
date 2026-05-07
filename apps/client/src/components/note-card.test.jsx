import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { NoteCard } from "./note-card.jsx";

const MOCK_NOTE = {
  id: "69f4d84da6568a97bd8d333a",
  content: "Component testing is done with react-testing-library",
  important: true,
};

test("renders note content", async () => {
  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByText(MOCK_NOTE.content)).toBeVisible();
});

test("shows correct button label based on importance", async () => {
  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );
  const toggleButton = screen.getByRole("button", { name: /toggle not important/i });

  await toggleButton.click();

  // Rerender with new state (simulating parent state update)
  await screen.rerender(
    <NoteCard
      note={{ ...MOCK_NOTE, important: false }}
      onImportanceToggle={vi.fn()}
      onDelete={vi.fn()}
    />,
  );

  await expect.element(screen.getByRole("button", { name: /toggle important/i })).toBeVisible();
});

test("calls event handler when toggle button is clicked", async () => {
  const onImportanceToggle = vi.fn();
  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={onImportanceToggle} onDelete={vi.fn()} />,
  );

  await screen.getByRole("button", { name: /toggle not important/i }).click();

  expect(onImportanceToggle).toHaveBeenCalledWith(MOCK_NOTE.id);
});

test("calls event handler when delete button is clicked and confirmed", async () => {
  const onDelete = vi.fn();
  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={vi.fn()} onDelete={onDelete} />,
  );
  const shouldDeleteConfirmation = vi.spyOn(window, "confirm").mockImplementation(() => true);

  await screen.getByRole("button", { name: /delete/i }).click();

  expect(shouldDeleteConfirmation).toHaveBeenCalledWith(`Remove note "${MOCK_NOTE.content}"?`);
  expect(onDelete).toHaveBeenCalledWith(MOCK_NOTE.id);
});

test("does not call the event handler when delete button is clicked and not confirmed", async () => {
  const onDelete = vi.fn();
  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={vi.fn()} onDelete={onDelete} />,
  );
  const shouldDeleteConfirmation = vi.spyOn(window, "confirm").mockImplementation(() => false);

  await screen.getByRole("button", { name: /delete/i }).click();

  expect(shouldDeleteConfirmation).toHaveBeenCalledWith(`Remove note "${MOCK_NOTE.content}"?`);
  expect(onDelete).toHaveBeenCalledTimes(0);
});

test("action buttons are grouped with label", async () => {
  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByRole("group", { name: /note actions/i })).toBeVisible();
});
