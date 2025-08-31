const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Subject", 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher", 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Class", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Exam date cannot be in the past'
    }
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 300, // 5 hours max
    default: 60
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1,
    max: 1000,
    default: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ExamSchema.index({ subjectId: 1 });
ExamSchema.index({ teacherId: 1 });
ExamSchema.index({ classId: 1 });
ExamSchema.index({ date: 1 });
ExamSchema.index({ isActive: 1 });

// Compound indexes for efficient queries
ExamSchema.index({ classId: 1, date: 1 });
ExamSchema.index({ subjectId: 1, date: 1 });

module.exports = mongoose.model("Exam", ExamSchema);