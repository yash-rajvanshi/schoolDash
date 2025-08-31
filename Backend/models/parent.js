const mongoose = require("mongoose");

const ParentSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200
  },
  relationship: {
    type: String,
    enum: ['father', 'mother', 'guardian', 'other'],
    required: true
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: 100
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student" 
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ParentSchema.index({ email: 1 });
ParentSchema.index({ username: 1 });
ParentSchema.index({ phone: 1 });
ParentSchema.index({ isActive: 1 });

// Virtual for full name
ParentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
ParentSchema.set('toJSON', { virtuals: true });
ParentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Parent", ParentSchema);