const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  present: { type: Boolean, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);