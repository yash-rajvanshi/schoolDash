const express = require("express");
const router = express.Router();
const Class = require("../models/class");

// router.post("/", async (req, res) => {
//   try {
//     const newClass = await Class.insertMany(req.body);
//     // await newClass.save();
//     res.status(201).json(newClass);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

router.post('/', async (req, res) => {
    try {
        // If request body is an array, insertMany; otherwise, create one
        if (Array.isArray(req.body)) {
            const classes = await Class.insertMany(req.body);
            res.status(201).json(classes);
        } else {
            const classes = new Class(req.body);
            await classes.save();
            res.status(201).json(classes);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// router.get("/", async (req, res) => {
//   try {
//     const classes = await Class.find();
//     res.status(200).json(classes);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("gradeId", "level"); // populate only 'level' from Grade

    const modifiedClasses = classes.map(cls => ({
      _id: cls._id,
      name: cls.name,
      capacity: cls.capacity,
      level: cls.gradeId?.level || "N/A",
      supervisorId: cls.supervisorId,
      lessons: cls.lessons,
      students: cls.students,
      events: cls.events,
      announcements: cls.announcements
    }));

    res.json(modifiedClasses);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
});

module.exports = router;