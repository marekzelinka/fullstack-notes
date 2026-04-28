import { Note } from "../src/models/note.js";
import { User } from "../src/models/user.js";

export const apiTestUtils = {
  initialNotes: [
    {
      content: "HTML is easy",
      important: false,
    },
    {
      content: "Browser can execute only JavaScript",
      important: true,
    },
  ],
  getNonExistingNoteId: async () => {
    const note = new Note({ content: "willremovethissoon" });
    await note.save();
    await note.deleteOne();

    return note._id.toString();
  },
  getNotesInDb: async () => {
    const notes = await Note.find();

    return notes.map((note) => note.toJSON());
  },
  getUsersInDb: async () => {
    const users = await User.find();

    return users.map((user) => user.toJSON());
  },
};
