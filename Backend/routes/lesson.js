const express = require("express");
const router = express.Router();
const Lesson = require("../models/lesson");

// 📌 Create a new Lesson
router.post("/", async (req, res) => {
  try {
    const newLesson = new Lesson(req.body);
    await newLesson.save();
    res.status(201).json({ message: "Lesson created successfully!", lesson: newLesson });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Lessons
router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.find().populate("subjectId").populate("classId").populate("teacherId");
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get a single Lesson by ID
router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("subjectId").populate("classId").populate("teacherId");
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update a Lesson by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLesson) return res.status(404).json({ error: "Lesson not found" });
    res.status(200).json({ message: "Lesson updated successfully!", lesson: updatedLesson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete a Lesson by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!deletedLesson) return res.status(404).json({ error: "Lesson not found" });
    res.status(200).json({ message: "Lesson deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;