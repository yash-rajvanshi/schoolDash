const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
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
  dueDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Due date cannot be in the past'
    }
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
    maxlength: 1000
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AssignmentSchema.index({ subjectId: 1 });
AssignmentSchema.index({ teacherId: 1 });
AssignmentSchema.index({ classId: 1 });
AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ isActive: 1 });

// Compound indexes for efficient queries
AssignmentSchema.index({ classId: 1, dueDate: 1 });
AssignmentSchema.index({ subjectId: 1, dueDate: 1 });

module.exports = mongoose.model("Assignment", AssignmentSchema);