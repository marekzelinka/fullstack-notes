import { env } from "./config.js";

export function logInfo(...params) {
  if (env.NODE_ENV === "test") {
    return;
  }

  console.log(...params);
}

export function logError(...params) {
  if (env.NODE_ENV === "test") {
    return;
  }

  return console.error(...params);
}
