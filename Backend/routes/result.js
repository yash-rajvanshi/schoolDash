const express = require("express");
const router = express.Router();
const Result = require("../models/result");

// 📌 Create a new Result
router.post("/", async (req, res) => {
  try {
    const newResult = new Result(req.body);
    await newResult.save();
    res.status(201).json({ message: "Result created successfully!", result: newResult });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Results
router.get("/", async (req, res) => {
  try {
    const results = await Result.find().populate("studentId").populate("examId").populate("assignmentId");
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get a single Result by ID
router.get("/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate("studentId").populate("examId").populate("assignmentId");
    if (!result) return res.status(404).json({ error: "Result not found" });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update a Result by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedResult = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedResult) return res.status(404).json({ error: "Result not found" });
    res.status(200).json({ message: "Result updated successfully!", result: updatedResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete a Result by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedResult = await Result.findByIdAndDelete(req.params.id);
    if (!deletedResult) return res.status(404).json({ error: "Result not found" });
    res.status(200).json({ message: "Result deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;