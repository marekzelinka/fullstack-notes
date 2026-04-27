import supertest from "supertest";
import { beforeEach, describe, test, expect } from "vitest";

import { app } from "../src/app.js";
import { Note } from "../src/models/note.js";
import { noteTestUtils } from "./note-test-utils.js";

const api = supertest(app);

describe("when there are initially some notes saved", () => {
  beforeEach(async () => {
    await Note.insertMany(noteTestUtils.initial);
  });

  describe("addition of a new note", () => {
    test("succeeds with valid data", async () => {
      const newNote = { content: "Integration test note", important: true };

      const res = await api.post("/api/notes").send(newNote);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);

      const notesAtEnd = await noteTestUtils.getSaved();
      expect(notesAtEnd).toHaveLength(noteTestUtils.initial.length + 1);
      const contents = notesAtEnd.map((note) => note.content);
      expect(contents).toContain(newNote.content);
    });

    test("succeeds without important that defaults to false", async () => {
      const newNote = { content: "Integration test note" };

      const res = await api.post("/api/notes").send(newNote);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.important).toBe(false);
    });

    test.each([
      { data: { important: true }, error: /content is required/i },
      { data: { content: "lol" }, error: /content must be at least 5 characters long/i },
    ])("fails with status 400 with $data and $error", async ({ data, error }) => {
      const res = await api.post("/api/notes").send(data);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(error);

      const notesAtEnd = await noteTestUtils.getSaved();
      expect(notesAtEnd).toHaveLength(noteTestUtils.initial.length);
    });
  });

  describe("viewing notes", () => {
    test("notes are returned as json", async () => {
      const res = await api.get("/api/notes");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    test("all notes are returned", async () => {
      const res = await api.get("/api/notes");
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(noteTestUtils.initial.length);
    });

    test("a specific note is within the returned notes", async () => {
      const res = await api.get("/api/notes");
      const contents = res.body.map((note) => note.content);
      expect(contents).toContain(noteTestUtils.initial[0].content);
    });

    describe("viewing a specific note", () => {
      test("succeeds with a valid id", async () => {
        const notesAtStart = await noteTestUtils.getSaved();
        const noteToView = notesAtStart[0];

        const res = await api.get(`/api/notes/${noteToView.id}`);
        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body).toStrictEqual(noteToView);
      });

      test("fails with status 404 if note does not exist", async () => {
        const validNonexistingId = await noteTestUtils.nonExistingId();

        const res = await api.get(`/api/notes/${validNonexistingId}`);
        expect(res.status).toBe(404);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/note not found/i);
      });

      test("fails with status 400 if id is invalid", async () => {
        const invalidId = "5a3d5da59070081a82a3445";

        const res = await api.get(`/api/notes/${invalidId}`);
        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/malformatted id/i);
      });
    });
  });

  describe("update of a note", () => {
    test("succeeds with a valid id and update data", async () => {
      const notesAtStart = await noteTestUtils.getSaved();
      const noteToEdit = notesAtStart[0];

      const res1 = await api.patch(`/api/notes/${noteToEdit.id}`).send({ important: true });
      expect(res1.status).toBe(200);
      expect(res1.headers["content-type"]).toMatch(/json/);
      expect(res1.body).toStrictEqual({ ...noteToEdit, important: true });

      const res2 = await api.patch(`/api/notes/${noteToEdit.id}`).send({ content: "HTML is hard" });
      expect(res1.status).toBe(200);
      expect(res2.body).toStrictEqual({
        ...noteToEdit,
        important: true,
        content: "HTML is hard",
      });

      const res3 = await api
        .patch(`/api/notes/${noteToEdit.id}`)
        .send({ content: "HTML is cool", important: false });
      expect(res1.status).toBe(200);
      expect(res3.body).toStrictEqual({
        ...noteToEdit,
        content: "HTML is cool",
        important: false,
      });
    });

    test("fails with status 404 if note does not exist", async () => {
      const validNonexistingId = await noteTestUtils.nonExistingId();

      const res = await api.patch(`/api/notes/${validNonexistingId}`).send({});
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/note not found/i);
    });

    test("fails with status 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      const res = await api.patch(`/api/notes/${invalidId}`).send({});
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/malformatted id/i);
    });
  });

  describe("deletion of a note", () => {
    test("succeeds with status 204 if id is valid", async () => {
      const notesAtStart = await noteTestUtils.getSaved();
      const noteToDelete = notesAtStart[0];

      const res = await api.delete(`/api/notes/${noteToDelete.id}`);
      expect(res.status).toBe(204);

      const notesAtEnd = await noteTestUtils.getSaved();
      expect(notesAtEnd).toHaveLength(noteTestUtils.initial.length - 1);
      const ids = notesAtEnd.map((note) => note.id);
      expect(ids).not.toContain(noteToDelete.id);
    });

    test("succeeds with status 204 even if note does not exist", async () => {
      const validNonexistingId = await noteTestUtils.nonExistingId();

      const res = await api.delete(`/api/notes/${validNonexistingId}`);
      expect(res.status).toBe(204);
    });

    test("fails with status 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      const res = await api.delete(`/api/notes/${invalidId}`);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/malformatted id/i);
    });
  });
});
