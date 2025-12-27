import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

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

// POST /auth/login - Login user
router.post('/login', [
  body('username').notEmpty().trim(),
  body('password').notEmpty()
], validate, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user with role
    const result = await pool.query(
      `SELECT u.*, r.name as role_name, r.permissions, r.is_system
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = $1 AND u.is_active = TRUE`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          roleName: user.role_name,
          permissions: user.permissions
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// POST /auth/register - Register new user (admin only)
router.post('/register', authenticate, [
  body('username').notEmpty().trim().isLength({ min: 3, max: 100 }),
  body('password').isLength({ min: 6 }),
  body('email').optional().isEmail(),
  body('fullName').optional().trim(),
  body('roleId').isUUID()
], validate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.roleName !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can create users'
      });
    }

    const { username, password, email, fullName, roleId } = req.body;

    // Check if username exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if role exists
    const roleResult = await pool.query('SELECT id FROM roles WHERE id = $1', [roleId]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, email, full_name, role_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, full_name, role_id, created_at`,
      [username, passwordHash, email || null, fullName || null, roleId, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// GET /auth/me - Get current user info
router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      roleName: req.user.roleName,
      permissions: req.user.permissions
    }
  });
});

// POST /auth/change-password - Change password
router.post('/change-password', authenticate, [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], validate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Get current user password
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, userResult.rows[0].password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

export default router;

