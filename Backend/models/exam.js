const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  teacher: { type: String, required: true },
  class: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Exam", ExamSchema);