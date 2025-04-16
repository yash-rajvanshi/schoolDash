const express = require("express");
const router = express.Router();
const Subject = require("../models/subject");

router.post("/", async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
