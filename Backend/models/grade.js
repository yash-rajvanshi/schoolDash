const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
  level: { type: Number, unique: true, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
});

module.exports = mongoose.model("Grade", GradeSchema);