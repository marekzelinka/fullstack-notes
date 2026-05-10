import supertest from "supertest";
import { beforeEach, test, describe } from "vitest";
import { expect } from "vitest";

import { app } from "../src/app.js";
import { hashPassword } from "../src/core/security.js";
import { Note } from "../src/models/note.js";
import { User } from "../src/models/user.js";
import { initialUser, getInitialNotes, getUsersInDb } from "./api-test-utils.js";

const api = supertest(app);

describe("when there is initially an user seeded with some notes", () => {
  let seededUserNotes;

  beforeEach(async () => {
    // Important: ensure the unique index is synced for the 'already taken' test
    await User.syncIndexes();

    const passwordHash = await hashPassword(initialUser.password);
    const user = await User.create({
      username: initialUser.username,
      name: initialUser.name,
      passwordHash,
    });

    seededUserNotes = getInitialNotes(user._id);
    const notes = await Note.insertMany(seededUserNotes);

    // Link seeded notes back to the user
    await User.findByIdAndUpdate(user._id, {
      $push: { notes: { $each: notes.map((note) => note._id) } },
    });
  });

  describe("creation of a new user", () => {
    test("succeeds with fresh usernmae", async () => {
      const usersAtStart = await getUsersInDb();

      const newUser = {
        username: "mzelinka",
        name: "Marek Zelinka",
        password: "securepassword123",
      };

      const res = await api.post("/api/users").send(newUser);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.username).toBe(newUser.username);
      expect(res.body).not.toHaveProperty("passwordHash");

      const usersAtEnd = await getUsersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

      const usernames = usersAtEnd.map((user) => user.username);
      expect(usernames).toContain(newUser.username);
    });

    test("fails with status 400 when password is too short", async () => {
      const usersAtStart = await getUsersInDb();

      const newUser = { username: "mzelinka", name: "Marek Zelinka", password: "sekret" };

      const res = await api.post("/api/users").send(newUser);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/password must be at least 8 characters long/i);

      const usersAtEnd = await getUsersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);

      const usernames = usersAtEnd.map((user) => user.username);
      expect(usernames).not.toContain(newUser.username);
    });

    test("fails with status 400 when username is already taken", async () => {
      const usersAtStart = await getUsersInDb();

      const newUser = { username: "root", name: "Marek Yelinka", password: "securepassword123" };

      const res = await api.post("/api/users").send(newUser);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/username must be unique/i);

      const usersAtEnd = await getUsersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
  });
});
