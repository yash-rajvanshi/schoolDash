const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  day: { 
    type: String, 
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], 
    required: true,
    lowercase: true
  },
  startTime: { 
    type: String, 
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  endTime: { 
    type: String, 
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Subject", 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Class", 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher", 
    required: true 
  },
  room: {
    type: String,
    trim: true,
    maxlength: 20
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
LessonSchema.index({ day: 1 });
LessonSchema.index({ classId: 1 });
LessonSchema.index({ teacherId: 1 });
LessonSchema.index({ subjectId: 1 });
LessonSchema.index({ isActive: 1 });

// Compound indexes for efficient queries
LessonSchema.index({ day: 1, startTime: 1 });
LessonSchema.index({ classId: 1, day: 1 });
LessonSchema.index({ teacherId: 1, day: 1 });

// Validation to ensure endTime is after startTime
LessonSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }
  next();
});

module.exports = mongoose.model("Lesson", LessonSchema);