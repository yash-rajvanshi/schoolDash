const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
});

module.exports = mongoose.model("Admin", AdminSchema);