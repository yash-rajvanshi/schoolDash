const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
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
  bloodType: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  sex: { 
    type: String, 
    enum: ["male", "female", "OTHER"],
    required: true
  },
  teacherId: {
    type: Number,
    unique: true,
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
  subjects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Subject"
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
TeacherSchema.index({ email: 1 });
TeacherSchema.index({ username: 1 });
TeacherSchema.index({ phone: 1 });
TeacherSchema.index({ isActive: 1 });

// Virtual for full name
TeacherSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
TeacherSchema.set('toJSON', { virtuals: true });
TeacherSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate unique subject code if not provided
TeacherSchema .pre('save', function(next) {
    // Generate a unique studentId based on timestamp and random number
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  this.teacherId = parseInt(timestamp + randomNum);
  next();
});


module.exports = mongoose.model("Teacher", TeacherSchema);