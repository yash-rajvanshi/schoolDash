const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
});

module.exports = mongoose.model("Subject", SubjectSchema);