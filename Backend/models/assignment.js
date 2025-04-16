const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Result" }],
});

module.exports = mongoose.model("Assignment", AssignmentSchema);