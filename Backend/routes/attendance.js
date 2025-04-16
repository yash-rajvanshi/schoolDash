const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");

// 📌 Create a new Attendance record
router.post("/", async (req, res) => {
  try {
    const newAttendance = new Attendance(req.body);
    await newAttendance.save();
    res.status(201).json({ message: "Attendance record created successfully!", attendance: newAttendance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Attendance records
router.get("/", async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().populate("studentId").populate("lessonId");
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get a single Attendance record by ID
router.get("/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate("studentId").populate("lessonId");
    if (!attendance) return res.status(404).json({ error: "Attendance record not found" });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update an Attendance record by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedAttendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAttendance) return res.status(404).json({ error: "Attendance record not found" });
    res.status(200).json({ message: "Attendance record updated successfully!", attendance: updatedAttendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete an Attendance record by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!deletedAttendance) return res.status(404).json({ error: "Attendance record not found" });
    res.status(200).json({ message: "Attendance record deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;