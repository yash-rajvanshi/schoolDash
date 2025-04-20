const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  teacher: { type: String, required: true },
  class: { type: String, required: true },
  dueDate: { type: Date, required: true },
  // lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  // results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Result" }],
});

module.exports = mongoose.model("Assignment", AssignmentSchema);