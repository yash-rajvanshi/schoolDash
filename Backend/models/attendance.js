const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Attendance date cannot be in the future'
    }
  },
  present: { 
    type: Boolean, 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Lesson", 
    required: true 
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 200
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ studentId: 1 });
AttendanceSchema.index({ lessonId: 1 });
AttendanceSchema.index({ markedBy: 1 });
AttendanceSchema.index({ date: 1, studentId: 1 });

// Compound index for efficient queries
AttendanceSchema.index({ date: 1, lessonId: 1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);