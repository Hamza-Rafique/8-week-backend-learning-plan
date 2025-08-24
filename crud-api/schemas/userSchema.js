const { z } = require('zod');

// User schema for validation
const userSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100, { message: "Name cannot exceed 100 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),
  
  email: z.string()
    .email({ message: "Invalid email address" })
    .max(100, { message: "Email cannot exceed 100 characters" }),
  
  age: z.number()
    .int({ message: "Age must be an integer" })
    .min(1, { message: "Age must be at least 1" })
    .max(150, { message: "Age cannot exceed 150" })
    .optional()
    .or(z.null()),
});

// Schema for user ID validation
const userIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, { message: "ID must be a numeric value" })
    .transform(Number)
});

// Schema for update (all fields optional but with same validation)
const userUpdateSchema = userSchema.partial();

module.exports = {
  userSchema,
  userIdSchema,
  userUpdateSchema
};