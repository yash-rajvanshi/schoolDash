const express = require("express");
const router = express.Router();
const Exam = require("../models/exam");

// 📌 Create a new Exam
router.post("/", async (req, res) => {
  try {
    const newExam = new Exam(req.body);
    await newExam.save();
    res.status(201).json({ message: "Exam created successfully!", exam: newExam });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Exams with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // default to page 1
    const limit = parseInt(req.query.limit) || 10;   // default to 10 Exams per page
    const skip = (page - 1) * limit;

    const totalExams = await Exam.countDocuments();           // total Exam count
    const exams = await Exam.find().skip(skip).limit(limit);  // paginated query

    const totalPages = Math.ceil(totalExams / limit);

    res.status(200).json({
      exams,
      totalExams,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create multiple Exam
router.post("/multiple", async (req, res) => {
  try {
    const ExamsData = req.body;
    let savedExams = [];

    if (Array.isArray(ExamsData)) {
      for (const data of ExamsData) {
        const newExam = new Exam(data);
        await newExam.save();
        savedExams.push(newExam);
      }
      res.status(201).json(savedExams);
    } else {
      const newExam = new Exam(ExamsData);
      await newExam.save();
      res.status(201).json(newExam);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get a single Exam by ID
router.get("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("lessonId");
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update an Exam by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExam) return res.status(404).json({ error: "Exam not found" });
    res.status(200).json({ message: "Exam updated successfully!", exam: updatedExam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete an Exam by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedExam = await Exam.findByIdAndDelete(req.params.id);
    if (!deletedExam) return res.status(404).json({ error: "Exam not found" });
    res.status(200).json({ message: "Exam deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;