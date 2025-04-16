const express = require("express");
const router = express.Router();
const Announcement = require("../models/announcement");

// 📌 Create new Announcements (single or multiple)
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      // Handle multiple announcements
      const newAnnouncements = await Announcement.insertMany(data);
      res.status(201).json({ message: "Announcements created successfully!", announcements: newAnnouncements });
    } else {
      // Handle single announcement
      const newAnnouncement = new Announcement(data);
      await newAnnouncement.save();
      res.status(201).json({ message: "Announcement created successfully!", announcement: newAnnouncement });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().populate("classId");
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get a single Announcement by ID
router.get("/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate("classId"); //populated classID
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update an Announcement by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAnnouncement) return res.status(404).json({ error: "Announcement not found" });
    res.status(200).json({ message: "Announcement updated successfully!", announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete an Announcement by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    if (!deletedAnnouncement) return res.status(404).json({ error: "Announcement not found" });
    res.status(200).json({ message: "Announcement deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;