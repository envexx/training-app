import express from 'express';
import bcrypt from 'bcrypt';
import { body, param, query, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(requireAdmin);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// GET /users - Get all users
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim()
], validate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let queryText = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
      queryText += ' AND (u.username ILIKE $1 OR u.email ILIKE $1 OR u.full_name ILIKE $1)';
      queryParams.push(`%${search}%`);
    }

    queryText += ` ORDER BY u.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1)';
      countParams.push(`%${search}%`);
    }

    const [result, countResult] = await Promise.all([
      pool.query(queryText, queryParams),
      pool.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users: result.rows.map(row => ({
          id: row.id,
          username: row.username,
          email: row.email,
          fullName: row.full_name,
          roleId: row.role_id,
          roleName: row.role_name,
          isActive: row.is_active,
          lastLogin: row.last_login,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// GET /users/:id
router.get('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, r.name as role_name, r.permissions
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        username: row.username,
        email: row.email,
        fullName: row.full_name,
        roleId: row.role_id,
        roleName: row.role_name,
        isActive: row.is_active,
        lastLogin: row.last_login,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// PUT /users/:id - Update user
router.put('/:id', [
  param('id').isUUID(),
  body('email').optional().isEmail(),
  body('fullName').optional().trim(),
  body('roleId').optional().isUUID(),
  body('isActive').optional().isBoolean(),
  body('password').optional().isLength({ min: 6 })
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullName, roleId, isActive, password } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }
    if (roleId !== undefined) {
      // Check if role exists
      const roleResult = await pool.query('SELECT id FROM roles WHERE id = $1', [roleId]);
      if (roleResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Role not found'
        });
      }
      updates.push(`role_id = $${paramCount++}`);
      values.push(roleId);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }
    if (password !== undefined) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Always add updated_by
    updates.push(`updated_by = $${paramCount++}`);
    values.push(req.user.id);
    values.push(id);
    const queryText = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, full_name, role_id, is_active, updated_at`;

    const result = await pool.query(queryText, values);

    res.json({
      success: true,
      message: 'User berhasil diupdate',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// DELETE /users/:id
router.delete('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    // Prevent deleting own account
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

export default router;

