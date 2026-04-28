import supertest from "supertest";
import { beforeEach, test, describe } from "vitest";
import { expect } from "vitest";

import { app } from "../src/app.js";
import { security } from "../src/core/security.js";
import { User } from "../src/models/user.js";
import { apiTestUtils } from "./api-test-utils.js";

const api = supertest(app);

describe("when there is initially on user saved", () => {
  beforeEach(async () => {
    const passwordHash = await security.hashPassword("sekret");

    await User.create({ username: "root", passwordHash });
  });

  describe("creation of a new user", () => {
    test("succeeds with fresh usernmae", async () => {
      const usersAtStart = await apiTestUtils.getUsersInDb();

      const newUser = { username: "mzelinka", name: "Marek Zelinka", password: "sekret" };

      const res = await api.post("/api/users").send(newUser);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);

      const usersAtEnd = await apiTestUtils.getUsersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
      const usernames = usersAtEnd.map((user) => user.username);
      expect(usernames).toContain(newUser.username);
    });

    test("fails with status 400 when username is already taken", async () => {
      const usersAtStart = await apiTestUtils.getUsersInDb();

      const newUser = { username: "root", name: "Marek Zelinka", password: "sekret" };

      const res = await api.post("/api/users").send(newUser);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/username must be unique/i);

      const usersAtEnd = await apiTestUtils.getUsersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
  });

  describe("viewing users", () => {
    test("users are returned as json", async () => {
      const res = await api.get("/api/users");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    test("all users are returned", async () => {
      const usersAtStart = await apiTestUtils.getUsersInDb();

      const res = await api.get("/api/users");
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(usersAtStart.length);
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
