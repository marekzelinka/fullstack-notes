import supertest from "supertest";
import { beforeEach, test, describe } from "vitest";
import { expect } from "vitest";

import { app } from "../src/app.js";
import * as security from "../src/core/security.js";
import { Note } from "../src/models/note.js";
import { User } from "../src/models/user.js";
import * as apiTestUtils from "./api-test-utils.js";

const api = supertest(app);

describe("when there is initially an user seeded with some notes", () => {
  let initialFirstUserNotes;

  beforeEach(async () => {
    // Important: ensure the unique index is synced for the 'already taken' test
    await User.syncIndexes();

    const passwordHash = await security.hashPassword(apiTestUtils.initialUser.password);
    const user = await User.create({
      username: apiTestUtils.initialUser.username,
      name: apiTestUtils.initialUser.name,
      passwordHash,
    });

    initialFirstUserNotes = apiTestUtils.getInitialNotes(user._id);
    const notes = await Note.insertMany(initialFirstUserNotes);

    // Link seeded notes back to the user
    await User.findByIdAndUpdate(user._id, {
      $push: { notes: { $each: notes.map((note) => note._id) } },
    });
  });

  describe("creation of a new user", () => {
    test("succeeds with fresh usernmae", async () => {
      const usersAtStart = await apiTestUtils.getUsersInDb();

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

      const usersAtEnd = await apiTestUtils.getUsersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

      const usernames = usersAtEnd.map((user) => user.username);
      expect(usernames).toContain(newUser.username);
    });

    test("fails with status 400 when password is too short", async () => {
      const usersAtStart = await apiTestUtils.getUsersInDb();

      const newUser = { username: "mzelinka", name: "Marek Zelinka", password: "sekret" };

      const res = await api.post("/api/users").send(newUser);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/password must be at least 8 characters long/i);

      const usersAtEnd = await apiTestUtils.getUsersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);

      const usernames = usersAtEnd.map((user) => user.username);
      expect(usernames).not.toContain(newUser.username);
    });

    test("fails with status 400 when username is already taken", async () => {
      const usersAtStart = await apiTestUtils.getUsersInDb();

      const newUser = { username: "root", name: "Marek Yelinka", password: "securepassword123" };

      const res = await api.post("/api/users").send(newUser);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/username must be unique/i);

      const usersAtEnd = await apiTestUtils.getUsersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
  });

  describe("viewing users", () => {
    test("returns users with their notes populated", async () => {
      const res = await api.get("/api/users");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(Array.isArray(res.body)).toBe(true);

      const seededUser = res.body[0];
      expect(seededUser.notes).toHaveLength(initialFirstUserNotes.length);

      const contents = seededUser.notes.map((note) => note.content);
      const expectedContents = initialFirstUserNotes.map((note) => note.content);
      expect(contents).toEqual(expect.arrayContaining(expectedContents));
      expect(seededUser.notes[0].content).toBe(initialFirstUserNotes[0].content);
    });

    test("a specific user is within the returned users", async () => {
      const usersAtStart = await apiTestUtils.getUsersInDb();
      const userToView = usersAtStart[0];

      const res = await api.get("/api/users");

      const usernames = res.body.map((user) => user.username);
      expect(usernames).toContain(userToView.username);
    });
  });
});
