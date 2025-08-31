const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  capacity: { 
    type: Number, 
    required: true,
    min: 1,
    max: 100
  },
  supervisorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher",
    required: true
  },
  grade: { 
    type: String, 
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ClassSchema.index({ name: 1 });
ClassSchema.index({ supervisorId: 1 });
ClassSchema.index({ grade: 1 });
ClassSchema.index({ isActive: 1 });

module.exports = mongoose.model("Class", ClassSchema);