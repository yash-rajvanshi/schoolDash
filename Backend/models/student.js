// Backend/models/student.js
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
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
  studentId: { type: Number, unique: true, required: true },
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
    sparse: true,
    required: true,
    trim: true,
    match: [/^[\+]?[\s\-\(\)]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  address: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200
  },
  photo: { 
    type: String,
    default: null
  },
  grade: { 
    type: Number,
    min: 1,
    max: 12
  },
  bloodType: { 
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  sex: { 
    type: String, 
    enum: ["male", "female", "OTHER"],
    required: true
  },
  birthday: { 
    type: Date,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Birthday cannot be in the future'
    }
  },
  class: { 
    type: String,
    trim: true
  },
  // classId: { 
  //   type: mongoose.Schema.Types.ObjectId, 
  //   ref: "Class"
  // },
  // gradeId: { 
  //   type: mongoose.Schema.Types.ObjectId, 
  //   ref: "Grade"
  // },
  classId: { 
    type: String,
    trim: true
  },
  gradeId: { 
    type: String,
    trim: true
  },
  attendance: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Attendance"
  }],
  results: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Result"
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
StudentSchema.index({ email: 1 });
StudentSchema.index({ username: 1 });
StudentSchema.index({ phone: 1 });
StudentSchema.index({ classId: 1 });
StudentSchema.index({ gradeId: 1 });
StudentSchema.index({ isActive: 1 });

// Virtual for full name
StudentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate unique subject code if not provided
StudentSchema.pre('save', function(next) {
  if (!this.studentId) {
    // Generate a unique studentId based on timestamp and random number
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.studentId = parseInt(timestamp + randomNum);
  }
  next();
});

module.exports = mongoose.model("Student", StudentSchema);