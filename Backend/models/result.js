const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", default: null },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", default: null },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
});

module.exports = mongoose.model("Result", ResultSchema);