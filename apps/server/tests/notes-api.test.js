import supertest from "supertest";
import { beforeEach, describe, test, expect } from "vitest";

import { app } from "../src/app.js";
import * as security from "../src/core/security.js";
import { Note } from "../src/models/note.js";
import { User } from "../src/models/user.js";
import * as apiTestUtils from "./api-test-utils.js";

const api = supertest(app);

describe("when there are initially some notes seeded with a owner", () => {
  let authHeader;
  let user;
  let userNotes;

  beforeEach(async () => {
    const passwordHash = await security.hashPassword(apiTestUtils.initialUser.password);
    user = await User.create({
      username: apiTestUtils.initialUser.username,
      name: apiTestUtils.initialUser.name,
      passwordHash,
    });

    const token = security.createAccessToken({ sub: user.username });
    authHeader = { Authorization: `Bearer ${token}` };

    userNotes = apiTestUtils.getInitialNotes(user._id);
    const notes = await Note.insertMany(userNotes);

    // Link seeded notes back to the user
    await User.findByIdAndUpdate(user._id, {
      $push: { notes: { $each: notes.map((note) => note._id) } },
    });
  });

  describe("addition of a new note", () => {
    test("succeeds with valid data", async () => {
      const newNote = { content: "Integration test note", important: false };

      const res = await api.post("/api/notes").set(authHeader).send(newNote);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);

      const notesAtEnd = await apiTestUtils.getNotesInDb();
      expect(notesAtEnd).toHaveLength(userNotes.length + 1);

      const contents = notesAtEnd.map((note) => note.content);
      expect(contents).toContain(newNote.content);

      const userInDb = await User.findOne({ username: apiTestUtils.initialUser.username });
      const userNoteIds = userInDb.notes.map((id) => id.toString());
      expect(userNoteIds).toContain(res.body.id);
    });

    test("succeeds without important that defaults to true", async () => {
      const newNote = { content: "Integration test note" };

      const res = await api.post("/api/notes").set(authHeader).send(newNote);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.important).toBe(true);
    });

    test.for([
      [{ important: true }, /content is required/i],
      [{ content: "lol" }, /content must be at least 5 characters long/i],
    ])(
      "fails with status 400 when data (%i) is invalid, returning error (%i)",
      async (
        [data, error],
        {
          expect, // oxlint-disable-line no-shadow
        },
      ) => {
        const res = await api.post("/api/notes").set(authHeader).send(data);
        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(error);

        const notesAtEnd = await apiTestUtils.getNotesInDb();
        expect(notesAtEnd).toHaveLength(userNotes.length);
      },
    );

    test("fails with status 401 if auth header is missing", async () => {
      const newNote = { content: "Integration test note", important: true };

      const res = await api.post("/api/notes").send(newNote);
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });
  });

  describe("viewing notes", () => {
    test("returns all owned by the user", async () => {
      const res = await api.get("/api/notes").set(authHeader);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveLength(userNotes.length);
    });

    test("returned notes owned by user match seed content", async () => {
      const res = await api.get("/api/notes").set(authHeader);

      const contents = res.body.map((note) => note.content);
      const expectedContent = userNotes.map((note) => note.content);
      expect(contents).toEqual(expect.arrayContaining(expectedContent));
    });

    test("fails with status 401 if auth header is missing", async () => {
      const res = await api.get("/api/notes");
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });

    describe("viewing a specific note", () => {
      test("succeeds when owned by user", async () => {
        const notesAtStart = await apiTestUtils.getNotesInDb();
        const noteToView = notesAtStart[0];

        const res = await api.get(`/api/notes/${noteToView.id}`).set(authHeader);
        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body).toStrictEqual(noteToView);
      });

      test("fails with status 400 if id is invalid", async () => {
        const invalidId = "1";

        const res = await api.get(`/api/notes/${invalidId}`).set(authHeader);
        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/malformatted id/i);
      });

      test("fails with status 401 if auth header is missing", async () => {
        const notesAtStart = await apiTestUtils.getNotesInDb();
        const noteToView = notesAtStart[0];

        const res = await api.get(`/api/notes/${noteToView.id}`);
        expect(res.status).toBe(401);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/invalid authentication credentials/i);
      });

      test("fails with status 404 if trying to view someone else's note", async () => {
        const notesAtStart = await apiTestUtils.getNotesInDb();
        const noteToView = notesAtStart[0];

        const otherUser = await User.create({ username: "hacker", passwordHash: "..." });
        const otherHeader = {
          Authorization: `Bearer ${security.createAccessToken({ sub: otherUser.username })}`,
        };

        const res = await api.get(`/api/notes/${noteToView.id}`).set(otherHeader);
        expect(res.status).toBe(404);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/note not found or unauthorized/i);
      });

      test("fails with status 404 if note does not exist", async () => {
        const validNonexistingId = await apiTestUtils.getValidNonExistingNoteId(user._id);

        const res = await api.get(`/api/notes/${validNonexistingId}`).set(authHeader);
        expect(res.status).toBe(404);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/note not found or unauthorized/i);
      });
    });
  });

  describe("update of a note", () => {
    test("succeeds when owned by the user", async () => {
      const notesAtStart = await apiTestUtils.getNotesInDb();
      const noteToEdit = notesAtStart[0];
      const updatedData = { content: "Updated by owner", important: true };

      const res = await api.patch(`/api/notes/${noteToEdit.id}`).set(authHeader).send(updatedData);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.content).toBe(updatedData.content);
      expect(res.body.important).toBe(updatedData.important);
    });

    test("ignores attempts to change the immutable owner", async () => {
      const notesAtStart = await apiTestUtils.getNotesInDb();
      const noteToEdit = notesAtStart[0];

      const otherUser = await User.create({ username: "other", passwordHash: "..." });

      const res = await api
        .patch(`/api/notes/${noteToEdit.id}`)
        .set(authHeader) // auth header is note owner
        .send({ owner: otherUser._id.toString() });
      expect(res.status).toBe(200);

      const noteInDb = await Note.findById(noteToEdit.id);
      expect(noteInDb.owner.toString()).not.toBe(otherUser._id.toString());
      expect(noteInDb.owner.toString()).toBe(user._id.toString());
    });

    test("fails with status 400 if id is invalid", async () => {
      const invalidId = "1";

      const res = await api.patch(`/api/notes/${invalidId}`).set(authHeader).send({});
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/malformatted id/i);
    });

    test("fails with status 401 if auth header is missing", async () => {
      const notesAtStart = await apiTestUtils.getNotesInDb();
      const noteToEdit = notesAtStart[0];
      const updatedData = { content: "Updated by owner", important: true };

      const res = await api.patch(`/api/notes/${noteToEdit.id}`).send({ updatedData });
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });

    test("fails with status 404 if trying to update someone else's note", async () => {
      const notesAtStart = await apiTestUtils.getNotesInDb();
      const noteToEdit = notesAtStart[0];

      const otherUser = await User.create({ username: "hacker", passwordHash: "..." });
      const otherHeader = {
        Authorization: `Bearer ${security.createAccessToken({ sub: otherUser.username })}`,
      };

      const res = await api
        .patch(`/api/notes/${noteToEdit.id}`)
        .set(otherHeader)
        .send({ content: "Hacked!" });
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/note not found or unauthorized/i);
    });

    test("fails with status 404 if note does not exist", async () => {
      const validNonexistingId = await apiTestUtils.getValidNonExistingNoteId(user._id);

      const res = await api
        .patch(`/api/notes/${validNonexistingId}`)
        .set(authHeader)
        .send({ important: true });
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/note not found/i);
    });
  });

  describe("deletion of a note", () => {
    test("succeeds when owned by user", async () => {
      const notesAtStart = await apiTestUtils.getNotesInDb();
      const noteToDelete = notesAtStart[0];

      const res = await api.delete(`/api/notes/${noteToDelete.id}`).set(authHeader);
      expect(res.status).toBe(204);

      const notesAtEnd = await apiTestUtils.getNotesInDb();
      expect(notesAtEnd).toHaveLength(userNotes.length - 1);

      const ids = notesAtEnd.map((note) => note.id);
      expect(ids).not.toContain(noteToDelete.id);

      const userInDb = await User.findOne({ username: apiTestUtils.initialUser.username });
      const userNoteIds = userInDb.notes.map((id) => id.toString());
      expect(userNoteIds).not.toContain(noteToDelete.id);
    });

    test("fails with status 400 if id is invalid", async () => {
      const invalidId = "1";

      const res = await api.delete(`/api/notes/${invalidId}`).set(authHeader);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/malformatted id/i);
    });

    test("fails with status 401 if auth header is missing", async () => {
      const notesAtStart = await apiTestUtils.getNotesInDb();
      const noteToDelete = notesAtStart[0];

      const res = await api.delete(`/api/notes/${noteToDelete.id}`);
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });

    test("fails with status 404 if trying to delete someone else's note", async () => {
      const notesAtStart = await apiTestUtils.getNotesInDb();
      const noteToDelete = notesAtStart[0];

      const otherUser = await User.create({ username: "hacker", passwordHash: "..." });
      const otherHeader = {
        Authorization: `Bearer ${security.createAccessToken({ sub: otherUser.username })}`,
      };

      const res = await api.delete(`/api/notes/${noteToDelete.id}`).set(otherHeader);
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/note not found or unauthorized/i);
    });

    test("fails with status 404 if note does not exist", async () => {
      const validNonexistingId = await apiTestUtils.getValidNonExistingNoteId(user._id);

      const res = await api.delete(`/api/notes/${validNonexistingId}`).set(authHeader);
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/note not found or unauthorized/i);
    });
  });
});
