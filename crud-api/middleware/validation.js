const validate = (schema) => (req, res, next) => {
  try {
    // Validate request body against the schema
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    // Format Zod errors for better response
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    res.status(400).json({
      error: "Validation failed",
      details: errors
    });
  }
};

// Middleware for validating ID parameter
const validateId = (schema) => (req, res, next) => {
  try {
    const validatedParams = schema.parse(req.params);
    req.validatedParams = validatedParams;
    next();
  } catch (error) {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    res.status(400).json({
      error: "Invalid ID parameter",
      details: errors
    });
  }
};

module.exports = {
  validate,
  validateId
};