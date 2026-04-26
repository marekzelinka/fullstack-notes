import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  content: { type: String, minLength: 5, required: true },
  important: { type: Boolean, default: false },
});

noteSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const Note = mongoose.model("Note", noteSchema);
