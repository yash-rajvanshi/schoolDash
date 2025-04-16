const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  date: { type: Date, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
});

module.exports = mongoose.model("Event", EventSchema);