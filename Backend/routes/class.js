const express = require("express");
const router = express.Router();
const Class = require("../models/class");

// 📌 Create a new Class
router.post("/", async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json({ message: "Class created successfully!", class: newClass });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Classes with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // default to page 1
    const limit = parseInt(req.query.limit) || 10;   // default to 10 Classes per page
    const skip = (page - 1) * limit;

    const totalClasses = await Class.countDocuments();           // total Class count
    const classes = await Class.find().skip(skip).limit(limit);  // paginated query

    const totalPages = Math.ceil(totalClasses / limit);

    res.status(200).json({
      classes,
      totalClasses,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create multiple Class
router.post("/multiple", async (req, res) => {
  try {
    const ClassesData = req.body;
    let savedClasses = [];

    if (Array.isArray(ClassesData)) {
      for (const data of ClassesData) {
        const newClass = new Class(data);
        await newClass.save();
        savedClasses.push(newClass);
      }
      res.status(201).json(savedClasses);
    } else {
      const newClass = new Class(ClassesData);
      await newClass.save();
      res.status(201).json(newClass);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) return res.status(404).json({ error: "Class not found" });
    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) return res.status(404).json({ error: "Class not found" });
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ error: "Class not found" });
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})



module.exports = router;