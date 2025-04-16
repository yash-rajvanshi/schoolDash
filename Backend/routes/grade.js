const express = require("express");
const router = express.Router();
const Grade = require("../models/grade");

// Handle both single and multiple entries
router.post("/", async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const grades = await Grade.insertMany(req.body);
      res.status(201).json(grades);
    } else {
      const newGrade = new Grade(req.body);
      await newGrade.save();
      res.status(201).json(newGrade);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const grades = await Grade.find();
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ error: "Grade not found" });
    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedGrade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGrade) return res.status(404).json({ error: "Grade not found" });
    res.status(200).json(updatedGrade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedGrade = await Grade.findByIdAndDelete(req.params.id);
    if (!deletedGrade) return res.status(404).json({ error: "Grade not found" });
    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;