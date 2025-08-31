const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  code: {
    type: String,
    unique: true,
    required: false,
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 10
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  teachers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher" 
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
SubjectSchema.index({ name: 1 });
SubjectSchema.index({ code: 1 });
SubjectSchema.index({ isActive: 1 });

module.exports = mongoose.model("Subject", SubjectSchema);