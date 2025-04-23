const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
});

module.exports = mongoose.model("Subject", SubjectSchema);