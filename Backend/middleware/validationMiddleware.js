const { validationResult } = require('express-validator');

// Middleware to check for validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Remove leading/trailing whitespace from string fields
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });
  next();
};

// Validate ObjectId format
const validateObjectId = (req, res, next) => {
  const mongoose = require('mongoose');
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'The provided ID is not valid'
    });
  }
  next();
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      error: 'Invalid Page',
      message: 'Page must be a positive number'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      error: 'Invalid Limit',
      message: 'Limit must be between 1 and 100'
    });
  }
  
  next();
};

module.exports = {
  validateRequest,
  sanitizeInput,
  validateObjectId,
  validatePagination
};
