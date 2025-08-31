const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  startTime: { 
    type: mongoose.Schema.Types.Mixed, // Allow both String and Date
    required: true,
    validate: {
      validator: function(v) {
        // If it's a string, validate HH:MM format
        if (typeof v === 'string') {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        }
        // If it's a Date object, it's valid
        if (v instanceof Date) {
          return !isNaN(v.getTime());
        }
        return false;
      },
      message: 'Start time must be either HH:MM format string or a valid Date'
    }
  },
  endTime: { 
    type: mongoose.Schema.Types.Mixed, // Allow both String and Date
    required: true,
    validate: {
      validator: function(v) {
        // If it's a string, validate HH:MM format
        if (typeof v === 'string') {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        }
        // If it's a Date object, it's valid
        if (v instanceof Date) {
          return !isNaN(v.getTime());
        }
        return false;
      },
      message: 'End time must be either HH:MM format string or a valid Date'
    }
  },
  date: { 
    type: Date, 
    required: true
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Class", 
    default: null 
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  eventType: {
    type: String,
    enum: ['academic', 'sports', 'cultural', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
EventSchema.index({ date: 1 });
EventSchema.index({ classId: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ isActive: 1 });

// Compound indexes for efficient queries
EventSchema.index({ classId: 1, date: 1 });
EventSchema.index({ date: 1, startTime: 1 });

// Validation to ensure endTime is after startTime
EventSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    let startMinutes, endMinutes;
    
    // Handle startTime
    if (typeof this.startTime === 'string') {
      const start = this.startTime.split(':').map(Number);
      startMinutes = start[0] * 60 + start[1];
    } else if (this.startTime instanceof Date) {
      startMinutes = this.startTime.getHours() * 60 + this.startTime.getMinutes();
    }
    
    // Handle endTime
    if (typeof this.endTime === 'string') {
      const end = this.endTime.split(':').map(Number);
      endMinutes = end[0] * 60 + end[1];
    } else if (this.endTime instanceof Date) {
      endMinutes = this.endTime.getHours() * 60 + this.endTime.getMinutes();
    }
    
    if (startMinutes !== undefined && endMinutes !== undefined && endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }
  next();
});

module.exports = mongoose.model("Event", EventSchema);