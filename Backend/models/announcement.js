const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);