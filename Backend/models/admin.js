const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
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
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_students', 'manage_teachers', 'manage_classes', 'manage_grades', 'view_reports', 'manage_system']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AdminSchema.index({ email: 1 });
AdminSchema.index({ username: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });

// Virtual for full name
AdminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
AdminSchema.set('toJSON', { virtuals: true });
AdminSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Admin", AdminSchema);