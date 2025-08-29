const express = require("express");
const router = express.Router();
const Assignment = require("../models/assignment");

// Create a new Assignment
router.post("/", async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    await newAssignment.save();
    res.status(201).json({ message: "Assignment created successfully!", assignment: newAssignment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// 📌 Get all Assignments with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // default to page 1
    const limit = parseInt(req.query.limit) || 10;   // default to 10 Assignments per page
    const skip = (page - 1) * limit;

    const totalAssignments = await Assignment.countDocuments();           // total Assignment count
    const assignments = await Assignment.find().skip(skip).limit(limit);  // paginated query

    const totalPages = Math.ceil(totalAssignments / limit);

    res.status(200).json({
      assignments,
      totalAssignments,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create multiple assignments
router.post("/multiple", async (req, res) => {
  try {
    const AssignmentsData = req.body;
    let savedAssignments = [];

    if (Array.isArray(AssignmentsData)) {
      for (const data of AssignmentsData) {
        const newAssignment = new Assignment(data);
        await newAssignment.save();
        savedAssignments.push(newAssignment);
      }
      res.status(201).json(savedAssignments);
    } else {
      const newAssignment = new Assignment(AssignmentsData);
      await newAssignment.save();
      res.status(201).json(newAssignment);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
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