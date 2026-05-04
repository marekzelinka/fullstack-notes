import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: [5, "Content must be at least 5 characters long"],
    required: [true, "Content is required"],
  },
  important: { type: Boolean, default: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A note must belong to a owner"],
    immutable: [true, "Changing the owner of a note is not allowed"],
  },
});

noteSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const Note = mongoose.model("Note", noteSchema);
