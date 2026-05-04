import { test, vi, expect } from "vitest";
import { render } from "vitest-browser-react";

import { AddNoteForm } from "./add-note-form.jsx";

test("calls event handler on submit", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<AddNoteForm onSubmit={onSubmit} />);

  await screen.getByRole("textbox", { name: /note/i }).fill("Testing a form...");

  await screen.getByRole("button", { name: /add new/i }).click();

  expect(onSubmit).toHaveBeenCalled({ content: "Testing a form..." });
});

test("resets form inputs on success", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<AddNoteForm onSubmit={onSubmit} />);

  const noteInput = screen.getByRole("textbox", { name: /note/i });
  await noteInput.fill("Testing a form...");

  await screen.getByRole("button", { name: /add new/i }).click();

  await expect.element(noteInput).toHaveValue("");
});

test("does not reset form inputs if submission fails", async () => {
  const newNoteContent = "Testing a form...";
  const onSubmit = vi.fn(() => ({ success: false }));

  const screen = await render(<AddNoteForm onSubmit={onSubmit} />);

  const noteInput = screen.getByRole("textbox", { name: /note/i });
  await noteInput.fill(newNoteContent);

  await screen.getByRole("button", { name: /add new/i }).click();

  await expect.element(noteInput).toHaveValue(newNoteContent);
});
