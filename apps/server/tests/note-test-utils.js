import { Note } from "../src/models/note.js";

export const noteTestUtils = {
  initial: [
    {
      content: "HTML is easy",
      important: false,
    },
    {
      content: "Browser can execute only JavaScript",
      important: true,
    },
  ],
  nonExistingId: async () => {
    const note = new Note({ content: "willremovethissoon" });
    await note.save();
    await note.deleteOne();

    return note._id.toString();
  },
  getSaved: async () => {
    const notes = await Note.find();

    return notes.map((note) => note.toJSON());
  },
};
