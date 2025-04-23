const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  capacity: { type: Number, required: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  // lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  // students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  grade: { type: String, required: true }
  // events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  // announcements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Announcement" }],
});

module.exports = mongoose.model("Class", ClassSchema);