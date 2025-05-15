import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  questions: [
    {
      serial: Number,
      annotate: {
        question: String,
        response: String,
        comment: String,
      },
      edited: String,
      answered: String,
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
