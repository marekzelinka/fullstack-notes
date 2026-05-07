import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { UserCard } from "./user-card.jsx";

test("renders display name when user.name is provided", async () => {
  const user = { name: "John Doe", username: "johndoe123" };
  const screen = await render(<UserCard user={user} onLogout={vi.fn()} />);

  await expect.element(screen.getByText("Logged in as John Doe")).toBeVisible();
});

test("falls back to username when user.name is missing", async () => {
  const user = { name: undefined, username: "johndoe123" };
  const screen = await render(<UserCard user={user} onLogout={vi.fn()} />);

  await expect.element(screen.getByText("Logged in as johndoe123")).toBeVisible();
});

test("calls onLogout when the button is clicked", async () => {
  const user = { name: "Alice" };
  const onLogout = vi.fn();
  const screen = await render(<UserCard user={user} onLogout={onLogout} />);

  await screen.getByRole("button", { name: /sign out/i }).click();

  expect(onLogout).toHaveBeenCalledTimes(1);
});
