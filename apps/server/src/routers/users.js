import express from "express";

import { security } from "../core/security.js";
import { User } from "../models/user.js";

export const usersRouter = express.Router();

usersRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  const passwordHash = await security.hashPassword(password);

  const user = await User.create({ username, name, passwordHash });

  res.status(201).json(user);
});

usersRouter.get("/", async (req, res) => {
  const users = await User.find();

  res.json(users);
});
