const pool = require('../config/db');
const { NotFoundError, DatabaseError } = require('../middleware/errorHandler');

// Get all users with pagination
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: "Invalid pagination parameters",
                details: "Page must be at least 1, limit between 1 and 100"
            });
        }

        const result = await pool.query(
            'SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        // Get total count for pagination metadata
        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            users: result.rows,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(new DatabaseError('Failed to fetch users'));
    }
};

// Get user by ID
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;

        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            throw new NotFoundError('User');
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Create new user
const createUser = async (req, res, next) => {
    try {
        const { name, email, age } = req.validatedData;

        const result = await pool.query(
            'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *',
            [name, email, age]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update user
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        const updateData = req.validatedData;

        // Build dynamic update query based on provided fields
        const setClauses = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updateData).forEach(key => {
            setClauses.push(`${key} = $${paramCount}`);
            values.push(updateData[key]);
            paramCount++;
        });

        if (setClauses.length === 0) {
            return res.status(400).json({
                error: "No valid fields provided for update"
            });
        }

        values.push(id);
        const query = `
      UPDATE users 
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} 
      RETURNING *
    `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new NotFoundError('User');
        }

        res.json({
            message: 'User updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;

        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('User');
        }

        res.json({
            message: 'User deleted successfully',
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};