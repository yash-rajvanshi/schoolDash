const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Result" }],
});

module.exports = mongoose.model("Exam", ExamSchema);