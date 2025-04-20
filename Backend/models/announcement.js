const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  // class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
  classes: [{ type: String, required: true}],
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);