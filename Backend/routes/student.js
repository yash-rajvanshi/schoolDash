require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const express = require("express");
const router = express.Router();
const Student = require("../models/student");

router.post("/", async (req, res) => {
  const { email, password, firstName, lastName, photo, ...studentData } = req.body;

  try {
    // 1. Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "student",
      firstName,
      lastName,
      photo,
    });

    // 4. Create the student
    const newStudent = new Student({
      ...studentData,
      email, // only if your student schema needs email too
      firstName,
      lastName,
      photo
    });
    await newStudent.save();

    // 5. Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, firstName: newUser.firstName,lastName: newUser.lastName, photo: newUser.photo  },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 6. Send response
    res.status(201).json({
      message: "Student and user registered successfully!",
      student: newStudent,
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
    // Rollback user if student creation fails
    if (email) {
      await User.deleteOne({ email });
    }
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});


// 📌 Get all students with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // default to page 1
    const limit = parseInt(req.query.limit) || 10;   // default to 10 students per page
    const skip = (page - 1) * limit;

    const totalStudents = await Student.countDocuments();           // total student count
    const students = await Student.find().skip(skip).limit(limit);  // paginated query

    const totalPages = Math.ceil(totalStudents / limit);

    res.status(200).json({
      students,
      totalStudents,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//count students

router.get("/countStudent",async(req,res)=>{
  try {
    const countStudent = await Student.find().countDocuments();
    res.status(200).json(({count:countStudent}));
  } catch (error) {
    res.status(500).json({message:"Internal Server Error."})
    
  }
})

router.get("/genderCount", async(req, res)=>{
  try {
    const genderCountFemale = await Student.find({sex:"female"}).countDocuments();
    const genderCountMale = await Student.find({sex:"male"}).countDocuments();
    res.status(200).json({female:genderCountFemale,male:genderCountMale})
    
  } catch (error) {
    res.status(500).json({message:"Internal Server Error."})
    
  }
})

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