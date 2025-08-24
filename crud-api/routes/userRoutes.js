const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const { validate, validateId } = require('../middleware/validation');
const { userSchema, userIdSchema, userUpdateSchema } = require('../schemas/userSchema');

// GET /api/users - Get all users with pagination
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', validateId(userIdSchema), getUserById);

// POST /api/users - Create new user
router.post('/', validate(userSchema), createUser);

// PUT /api/users/:id - Update user
router.put('/:id', validateId(userIdSchema), validate(userUpdateSchema), updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', validateId(userIdSchema), deleteUser);

module.exports = router;