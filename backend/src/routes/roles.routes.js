import express from 'express';
import { body, param, validationResult } from 'express-validator';
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

// GET /roles - Get all roles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, COUNT(u.id) as user_count FROM roles r LEFT JOIN users u ON r.id = u.role_id GROUP BY r.id ORDER BY r.created_at DESC'
    );

    res.json({
      success: true,
      data: {
        roles: result.rows.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description,
          permissions: row.permissions,
          isSystem: row.is_system,
          userCount: parseInt(row.user_count),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
});

// GET /roles/:id - Get role by ID
router.get('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, COUNT(u.id) as user_count FROM roles r LEFT JOIN users u ON r.id = u.role_id WHERE r.id = $1 GROUP BY r.id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        description: row.description,
        permissions: row.permissions,
        isSystem: row.is_system,
        userCount: parseInt(row.user_count),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: error.message
    });
  }
});

// POST /roles - Create new role
router.post('/', [
  body('name').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('permissions').optional().isObject()
], validate, async (req, res) => {
  try {
    const { name, description, permissions = {} } = req.body;

    // Check if name exists
    const existingRole = await pool.query('SELECT id FROM roles WHERE name = $1', [name]);
    if (existingRole.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    const result = await pool.query(
      `INSERT INTO roles (name, description, permissions, created_by)
       VALUES ($1, $2, $3::jsonb, $4) RETURNING *`,
      [name, description || null, JSON.stringify(permissions), req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Role berhasil dibuat',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        permissions: result.rows[0].permissions,
        isSystem: result.rows[0].is_system,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
});

// PUT /roles/:id - Update role
router.put('/:id', [
  param('id').isUUID(),
  body('name').optional().notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('permissions').optional().isObject()
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role exists and is not system role
    const existingRole = await pool.query('SELECT is_system FROM roles WHERE id = $1', [id]);
    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (existingRole.rows[0].is_system) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify system role'
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      // Check if new name conflicts
      const nameCheck = await pool.query('SELECT id FROM roles WHERE name = $1 AND id != $2', [name, id]);
      if (nameCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists'
        });
      }
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (permissions !== undefined) {
      updates.push(`permissions = $${paramCount++}::jsonb`);
      values.push(JSON.stringify(permissions));
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
    const queryText = `UPDATE roles SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(queryText, values);

    res.json({
      success: true,
      message: 'Role berhasil diupdate',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        permissions: result.rows[0].permissions,
        isSystem: result.rows[0].is_system,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
});

// DELETE /roles/:id - Delete role
router.delete('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    // Check if role exists and is not system role
    const existingRole = await pool.query('SELECT is_system FROM roles WHERE id = $1', [req.params.id]);
    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (existingRole.rows[0].is_system) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete system role'
      });
    }

    // Check if role is used by any user
    const usersResult = await pool.query('SELECT COUNT(*) FROM users WHERE role_id = $1', [req.params.id]);
    if (parseInt(usersResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role that is assigned to users'
      });
    }

    await pool.query('DELETE FROM roles WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Role berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
});

export default router;

