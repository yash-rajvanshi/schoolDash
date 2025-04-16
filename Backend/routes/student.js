const express = require("express");
const router = express.Router();
const Student = require("../models/student");

// 📌 Create new student(s)
router.post("/", async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const students = await Student.insertMany(req.body);
      res.status(201).json({ message: "Students added successfully!", students });
    } else {
      const newStudent = new Student(req.body);
      await newStudent.save();
      res.status(201).json({ message: "Student added successfully!", student: newStudent });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get a single student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update a student by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ error: "Student not found" });

    res.status(200).json({ message: "Student updated successfully!", student: updatedStudent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete a student by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ error: "Student not found" });

    res.status(200).json({ message: "Student deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;