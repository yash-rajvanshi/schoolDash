const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  day: { type: String, enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }],
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }],
});

module.exports = mongoose.model("Lesson", LessonSchema);