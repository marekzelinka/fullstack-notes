import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { Alert } from "./alert.jsx";

test("renders the message correctly", async () => {
  const message = "Note saved successfully!";
  const screen = await render(<Alert message={message} />);

  await expect.element(screen.getByText(message)).toBeVisible();
});

test("renders error alert with correct data-variant attribute", async () => {
  const screen = await render(<Alert variant="error" message="Something went wrong" />);
  const alert = screen.getByRole("status", { hasText: /Something went wrong/i });

  await expect.element(alert).toHaveAttribute("data-variant", "error");
});

test("renders success alert with correct data-variant attribute", async () => {
  const screen = await render(<Alert variant="success" message="Fixed!" />);
  const alert = screen.getByRole("status", { hasText: /fixed!/i });

  await expect.element(alert).toHaveAttribute("data-variant", "success");
});

test("has correct attributes for screen readers", async () => {
  const screen = await render(<Alert message="Update" />);
  const alert = screen.getByRole("status");

  await expect.element(alert).toHaveAttribute("role", "status");
  await expect.element(alert).toHaveAttribute("aria-atomic", "true");
});
