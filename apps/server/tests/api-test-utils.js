import { Note } from "../src/models/note.js";
import { User } from "../src/models/user.js";

export function getInitialNotes(userId) {
  return [
    {
      content: "HTML is easy",
      important: false,
      owner: userId,
    },
    {
      content: "Browser can execute only JavaScript",
      important: true,
      owner: userId,
    },
  ];
}

export async function getValidNonExistingNoteId(userId) {
  const note = new Note({ content: "willremovethissoon", owner: userId });
  await note.save();
  await note.deleteOne();

  return note._id.toString();
}

export async function getNotesInDb() {
  const notes = await Note.find();

  return notes.map((doc) => {
    const note = doc.toJSON();
    note.owner = note.owner.toString();

    return note;
  });
}

export const initialUser = {
  username: "root",
  name: "Admin User",
  password: "sekreeet",
};

export async function getUsersInDb() {
  const users = await User.find();

  return users.map((user) => user.toJSON());
}
