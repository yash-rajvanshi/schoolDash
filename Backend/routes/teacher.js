const express = require("express");
const router = express.Router();
const Teacher = require("../models/teacher");

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post("/", async (req, res) => {
  const { email, password, firstName, lastName, photo, ...teacherData } = req.body;

  try {
    // 1. Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user (now with names)
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "teacher",
      firstName,
      lastName,
      photo,
    });

    // 4. Create the teacher
    const newTeacher = new Teacher({
      ...teacherData,
      email,
      firstName,
      lastName,
      photo
    });
    await newTeacher.save();

    // 5. Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, firstName: newUser.firstName,lastName: newUser.lastName, photo: newUser.photo  },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 6. Send response
    res.status(201).json({
      message: "teacher and user registered successfully!",
      teacher: newTeacher,
      token,
      user: {
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        photo: newUser.photo,
      }
    });
  } catch (error) {
    if (email) {
      await User.deleteOne({ email });
    }
    res.status(500).json({ message: "Registration failed", error: error.message });
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

// 📌 Get all teachers with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // default to page 1
    const limit = parseInt(req.query.limit) || 10;   // default to 10 teachers per page
    const skip = (page - 1) * limit;

    const totalTeachers = await Teacher.countDocuments();           // total teacher count
    const teachers = await Teacher.find().skip(skip).limit(limit);  // paginated query

    const totalPages = Math.ceil(totalTeachers / limit);

    res.status(200).json({
      teachers,
      totalTeachers,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/countTeachers",async(req,res)=>{
  try {
    const countTeachers = await Teacher.find().countDocuments();
    res.status(200).json({count:countTeachers});
  } catch (error) {
    res.status(500).json({message:"Internal Server Error."})
    
  }
})

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