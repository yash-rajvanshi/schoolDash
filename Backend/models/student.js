// Backend/models/student.js
const mongoose = require("mongoose");

// Create a counter schema for auto-incrementing studentId
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema) || mongoose.model('Counter', CounterSchema);

const StudentSchema = new mongoose.Schema({
  studentId: { type: Number, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  address: { type: String, required: true },
  photo: { type: String },
  grade: { type: Number,  },
  bloodType: { type: String,  },
  sex: { type: String, enum: ["male", "female", "OTHER"],  },
  createdAt: { type: Date, default: Date.now },
  birthday: { type: String },
  class: { type: String,  },
  classId: { type: String,  },
  gradeId: { type: String,  },
  // attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }],
  // results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Result" }],
  attendance: [{ type: String }],  // <-- Change from ObjectId to String
  results: [{ type: String }],
});

// Pre-save middleware to auto-increment studentId
StudentSchema.pre('save', async function(next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'studentId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.studentId = counter.seq;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Student", StudentSchema);