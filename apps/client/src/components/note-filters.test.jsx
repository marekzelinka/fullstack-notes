import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { NoteFilters } from "./note-filters.jsx";

test("renders with 'Show important' when showAll is true", async () => {
  const screen = await render(<NoteFilters showAll={true} toggleShowAll={vi.fn()} />);

  await expect.element(screen.getByRole("button", { name: /show important/i })).toBeVisible();
});

test("renders with 'Show all' when showAll is false", async () => {
  const screen = await render(<NoteFilters showAll={false} toggleShowAll={vi.fn()} />);

  await expect.element(screen.getByRole("button", { name: /show all/i })).toBeVisible();
});

test("calls event handler when the button is clicked", async () => {
  const toggleShowAll = vi.fn();
  const screen = await render(<NoteFilters showAll={true} toggleShowAll={toggleShowAll} />);

  await screen.getByRole("button", { name: /show important/i }).click();

  expect(toggleShowAll).toHaveBeenCalledTimes(1);
});

test("has correct grouping for accessibility", async () => {
  const screen = await render(<NoteFilters showAll={true} toggleShowAll={vi.fn()} />);

  // Verifies the div acts as a group with the specific label
  await expect.element(screen.getByRole("group", { name: /note filter options/i })).toBeVisible();
});
