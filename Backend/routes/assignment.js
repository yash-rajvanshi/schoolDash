const express = require("express");
const router = express.Router();
const Assignment = require("../models/assignment");

// 📌 Create a new Assignment
router.post("/", async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    await newAssignment.save();
    res.status(201).json({ message: "Assignment created successfully!", assignment: newAssignment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("lessonId");
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get a single Assignment by ID
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate("lessonId");
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update an Assignment by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAssignment) return res.status(404).json({ error: "Assignment not found" });
    res.status(200).json({ message: "Assignment updated successfully!", assignment: updatedAssignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete an Assignment by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment) return res.status(404).json({ error: "Assignment not found" });
    res.status(200).json({ message: "Assignment deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;