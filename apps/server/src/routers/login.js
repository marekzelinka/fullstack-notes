import express from "express";
import jwt from "jsonwebtoken";

import { config } from "../core/config.js";
import { security } from "../core/security.js";
import { User } from "../models/user.js";

export const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  const passwordCorrect = user ? await security.verifyPassword(password, user.passwordHash) : false;
  if (!passwordCorrect) {
    res.status(401).json({ erorr: "Invalid username or password" });
    return;
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };
  const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 60 * 60 });

  res.status(200).send({ token, username: user.username, name: user.name });
});
