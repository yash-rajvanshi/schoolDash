const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Announcement date cannot be in the future'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  classes: [{ 
    type: String, 
    required: true,
    trim: true
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save middleware to handle optional authorId
AnnouncementSchema.pre('save', function(next) {
  // If authorId is undefined or null, remove it from the document
  if (this.authorId === undefined || this.authorId === null) {
    this.authorId = undefined;
  }
  next();
});

// Indexes for better query performance
AnnouncementSchema.index({ date: 1 });
AnnouncementSchema.index({ priority: 1 });
AnnouncementSchema.index({ authorId: 1 });
AnnouncementSchema.index({ isActive: 1 });
AnnouncementSchema.index({ expiresAt: 1 });

// Compound indexes for efficient queries
AnnouncementSchema.index({ classes: 1, date: 1 });
AnnouncementSchema.index({ priority: 1, date: 1 });

// TTL index for expired announcements (if expiresAt is set)
AnnouncementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Announcement", AnnouncementSchema);