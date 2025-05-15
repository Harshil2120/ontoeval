import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
  serial: Number,
  annotate: {
    question: String,
    response: String,
    comment: String,
  },
  edited: String,
  answered: String,
});

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;
