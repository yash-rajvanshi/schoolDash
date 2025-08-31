const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
  level: { 
    type: Number, 
    unique: true, 
    required: true,
    min: 1,
    max: 12,
    validate: {
      validator: Number.isInteger,
      message: 'Grade level must be an integer'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student" 
  }],
  classes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Class" 
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
GradeSchema.index({ level: 1 });
GradeSchema.index({ name: 1 });
GradeSchema.index({ isActive: 1 });

// Compound indexes for efficient queries
GradeSchema.index({ level: 1, isActive: 1 });

module.exports = mongoose.model("Grade", GradeSchema);