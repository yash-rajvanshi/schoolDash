const express = require("express");
const router = express.Router();
const Subject = require("../models/subject");
const Teacher = require("../models/teacher")

// 📌 Create a new Subject
router.post("/", async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json({ message: "Subject created successfully!", subject: newSubject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Subjects with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // default to page 1
    const limit = parseInt(req.query.limit) || 10;   // default to 10 Subjects per page
    const skip = (page - 1) * limit;

    const totalSubjects = await Subject.countDocuments();           // total Subject count
    const subjects = await Subject.find().skip(skip).limit(limit);  // paginated query

    const totalPages = Math.ceil(totalSubjects / limit);

    res.status(200).json({
      subjects,
      totalSubjects,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create multiple Subject
router.post("/multiple", async (req, res) => {
  try {
    const SubjectsData = req.body;
    let savedSubjects = [];

    if (Array.isArray(SubjectsData)) {
      for (const data of SubjectsData) {
        const newSubject = new Subject(data);
        await newSubject.save();
        savedSubjects.push(newSubject);
      }
      res.status(201).json(savedSubjects);
    } else {
      const newSubject = new Subject(SubjectsData);
      await newSubject.save();
      res.status(201).json(newSubject);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Other CRUD operations (GET by ID, PUT, DELETE) follow the same structure.
// 📌 Get a single subject by ID
router.get("/:id", async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update a subject by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const teacherUpdatedsub = await Teacher.find

    if (!updatedSubject) return res.status(404).json({ error: "Subject not found" });

    res.status(200).json({ message: "Subject updated successfully!", subject: updatedSubject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete a subject by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

    if (!deletedSubject) return res.status(404).json({ error: "Subject not found" });

    res.status(200).json({ message: "Subject deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
