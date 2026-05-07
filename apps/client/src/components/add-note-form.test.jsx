import { test, vi, expect } from "vitest";
import { render } from "vitest-browser-react";

import { AddNoteForm } from "./add-note-form.jsx";

test("calls event handler on submit", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));
  const screen = await render(<AddNoteForm onSubmit={onSubmit} />);

  await screen.getByRole("textbox", { name: /note/i }).fill("Testing a form...");
  await screen.getByRole("button", { name: /new note/i }).click();

  expect(onSubmit).toHaveBeenCalled({ content: "Testing a form..." });
});

test("resets inputs on submission success", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));
  const screen = await render(<AddNoteForm onSubmit={onSubmit} />);
  const noteInput = screen.getByRole("textbox", { name: /note/i });

  await noteInput.fill("Testing a form...");
  await screen.getByRole("button", { name: /new note/i }).click();

  await expect.element(noteInput).toHaveValue("");
});

test("does not reset inputs when submission fails", async () => {
  const newNoteContent = "Testing a form...";
  const onSubmit = vi.fn(() => ({ success: false }));
  const screen = await render(<AddNoteForm onSubmit={onSubmit} />);
  const noteInput = screen.getByRole("textbox", { name: /note/i });

  await noteInput.fill(newNoteContent);
  await screen.getByRole("button", { name: /new note/i }).click();

  await expect.element(noteInput).toHaveValue(newNoteContent);
});
