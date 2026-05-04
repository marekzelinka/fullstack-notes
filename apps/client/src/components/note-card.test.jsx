import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { NoteCard } from "./note-card.jsx";

const MOCK_NOTE = {
  id: "2ae1ffd0-0d9e-4a99-88aa-3bca58a74e20",
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

  await expect.element(toggleButton).toBeVisible();
  await toggleButton.click();

  // Rerender with new state (simulating parent state update)
  screen.rerender(
    <NoteCard
      note={{ ...MOCK_NOTE, important: false }}
      onImportanceToggle={vi.fn()}
      onDelete={vi.fn()}
    />,
  );

  await expect.element(screen.getByRole("button", { name: /toggle important/i })).toBeVisible();
});

test("calls correct event handler when toggle button is clicked", async () => {
  const onImportanceToggle = vi.fn();

  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={onImportanceToggle} onDelete={vi.fn()} />,
  );

  await screen.getByRole("button", { name: /toggle not important/i }).click();

  expect(onImportanceToggle).toHaveBeenCalledWith(MOCK_NOTE.id);
});

test("calls correct event handler when delete button is clicked", async () => {
  const onDelete = vi.fn();

  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={vi.fn()} onDelete={onDelete} />,
  );

  await screen.getByRole("button", { name: /delete/i }).click();

  expect(onDelete).toHaveBeenCalledWith(MOCK_NOTE.id);
});

test("delete button has correct label", async () => {
  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect
    .element(screen.getByRole("button", { name: /delete/i }))
    .toHaveAttribute("aria-label", "Delete");
});

test("action buttons are grouped with label", async () => {
  const screen = await render(
    <NoteCard note={MOCK_NOTE} onImportanceToggle={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByRole("group", { name: /note actions/i })).toBeVisible();
});
