// const mongoose = require("mongoose");

// const TeacherSchema = new mongoose.Schema({
//   username: { type: String, unique: true, required: true },
//   name: { type: String, required: true },
//   surname: { type: String, required: true },
//   email: { type: String, unique: true, sparse: true },
//   phone: { type: String, unique: true, sparse: true },
//   address: { type: String, required: true },
//   img: { type: String },
//   bloodType: { type: String, required: true },
//   sex: { type: String, enum: ["Male", "Female", "OTHER"], required: true },
//   createdAt: { type: Date, default: Date.now },
//   subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
//   lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
//   classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
// });

// module.exports = mongoose.model("Teacher", TeacherSchema);

// Backend/models/teacher.js -------------------------------------------------------------
const mongoose = require("mongoose");

// Create a counter schema for auto-incrementing teacherId
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

const TeacherSchema = new mongoose.Schema({
  teacherId: { type: Number, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  address: { type: String, required: true },
  photo: { type: String },
  // grade: { type: Number, required: true },
  bloodType: { type: String, required: true },
  sex: { type: String, enum: ["male", "female", "OTHER"], },
  createdAt: { type: Date, default: Date.now },
  birthday: { type: String },
  // class: { type: String, required: true },
  // classId: { type: String, required: true },
  // gradeId: { type: String, required: true },
  // subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  subjects: [{ type: String}],
  // lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  classes: [{ type: String}],
  
});

// Pre-save middleware to auto-increment teacherId
TeacherSchema.pre('save', async function(next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'teacherId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.teacherId = counter.seq;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Teacher", TeacherSchema);