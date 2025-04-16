const express = require("express");
const router = express.Router();
const Teacher = require("../models/teacher");

// Create Teacher
router.post("/", async (req, res) => {
  try {
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create multiple teachers
router.post("/multiple", async (req, res) => {
  try {
    const teachersData = req.body;
    let savedTeachers = [];

    if (Array.isArray(teachersData)) {
      for (const data of teachersData) {
        const newTeacher = new Teacher(data);
        await newTeacher.save();
        savedTeachers.push(newTeacher);
      }
      res.status(201).json(savedTeachers);
    } else {
      const newTeacher = new Teacher(teachersData);
      await newTeacher.save();
      res.status(201).json(newTeacher);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Teachers
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Teacher by ID
router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Teacher
router.put("/:id", async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTeacher) return res.status(404).json({ error: "Teacher not found" });
    res.status(200).json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Teacher
router.delete("/:id", async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) return res.status(404).json({ error: "Teacher not found" });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;