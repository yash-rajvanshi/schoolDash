const express = require("express");
const router = express.Router();
const Announcement = require("../models/announcement");

// 📌 Create a new Announcement
router.post("/", async (req, res) => {
  try {
    console.log('Received announcement data:', req.body);
    
    // Create announcement data, making authorId completely optional
    const announcementData = {
      title: req.body.title,
      content: req.body.content,
      classes: req.body.classes,
      date: req.body.date || new Date(),
      priority: req.body.priority || 'medium',
      isActive: true
    };

    // Only add authorId if it's a valid ObjectId
    if (req.body.authorId && req.body.authorId.trim() !== '') {
      announcementData.authorId = req.body.authorId;
    }

    console.log('Processed announcement data:', announcementData);

    const newAnnouncement = new Announcement(announcementData);
    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement created successfully!", announcement: newAnnouncement });
  } catch (error) {
    console.error('Announcement creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Announcements with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // default to page 1
    const limit = parseInt(req.query.limit) || 10;   // default to 10 Announcements per page
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const query = { isActive: true };
    
    // Add priority filter if provided
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    // Add class filter if provided
    if (req.query.class) {
      query.classes = req.query.class;
    }

    const totalAnnouncements = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .sort({ date: -1, priority: -1 }) // Sort by date (newest first) and priority
      .skip(skip)
      .limit(limit)
      .populate("authorId", "name email"); // Populate author information

    const totalPages = Math.ceil(totalAnnouncements / limit);

    res.status(200).json({
      announcements,
      totalAnnouncements,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create multiple Announcement
router.post("/multiple", async (req, res) => {
  try {
    const AnnouncementsData = req.body;
    let savedAnnouncements = [];

    if (Array.isArray(AnnouncementsData)) {
      for (const data of AnnouncementsData) {
        const newAnnouncement = new Announcement(data);
        await newAnnouncement.save();
        savedAnnouncements.push(newAnnouncement);
      }
      res.status(201).json(savedAnnouncements);
    } else {
      const newAnnouncement = new Announcement(AnnouncementsData);
      await newAnnouncement.save();
      res.status(201).json(newAnnouncement);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// // Get all Announcements
// router.get("/", async (req, res) => {
//   try {
//     const announcements = await Announcement.find().populate("classId");
//     res.status(200).json(announcements);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get a single Announcement by ID
router.get("/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate("classId"); //populated classID
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an Announcement by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAnnouncement) return res.status(404).json({ error: "Announcement not found" });
    res.status(200).json({ message: "Announcement updated successfully!", announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an Announcement by ID
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