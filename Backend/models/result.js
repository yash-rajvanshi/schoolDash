const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  score: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Score must be between 0 and 100'
    }
  },
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Exam", 
    default: null 
  },
  assignmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Assignment", 
    default: null 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
    required: true
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ResultSchema.index({ studentId: 1 });
ResultSchema.index({ examId: 1 });
ResultSchema.index({ assignmentId: 1 });
ResultSchema.index({ subjectId: 1 });
ResultSchema.index({ score: 1 });
ResultSchema.index({ grade: 1 });

// Compound indexes for efficient queries
ResultSchema.index({ studentId: 1, subjectId: 1 });
ResultSchema.index({ studentId: 1, examId: 1 });

// Pre-save middleware to calculate percentage and grade
ResultSchema.pre('save', function(next) {
  if (this.score && this.maxScore) {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
    
    // Calculate grade based on percentage
    if (this.percentage >= 97) this.grade = 'A+';
    else if (this.percentage >= 93) this.grade = 'A';
    else if (this.percentage >= 90) this.grade = 'A-';
    else if (this.percentage >= 87) this.grade = 'B+';
    else if (this.percentage >= 83) this.grade = 'B';
    else if (this.percentage >= 80) this.grade = 'B-';
    else if (this.percentage >= 77) this.grade = 'C+';
    else if (this.percentage >= 73) this.grade = 'C';
    else if (this.percentage >= 70) this.grade = 'C-';
    else if (this.percentage >= 67) this.grade = 'D+';
    else if (this.percentage >= 60) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

module.exports = mongoose.model("Result", ResultSchema);