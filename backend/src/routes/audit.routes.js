import express from 'express';
import { param, query, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getAuditLogs, getUserAuditLogs } from '../middleware/audit.js';

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

// GET /audit/record/:tableName/:recordId - Get audit logs for a specific record
router.get('/record/:tableName/:recordId', [
  param('tableName').notEmpty().trim(),
  param('recordId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt()
], validate, async (req, res) => {
  try {
    const { tableName, recordId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const logs = await getAuditLogs(tableName, recordId, limit);

    res.json({
      success: true,
      data: {
        tableName,
        recordId,
        logs: logs.map(log => ({
          id: log.id,
          action: log.action,
          username: log.username,
          fullName: log.full_name,
          email: log.email,
          oldData: log.old_data,
          newData: log.new_data,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
          createdAt: log.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
});

// GET /audit/user/:userId - Get audit logs for a specific user
router.get('/user/:userId', [
  param('userId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 500 }).toInt()
], validate, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const logs = await getUserAuditLogs(userId, limit);

    res.json({
      success: true,
      data: {
        userId,
        logs: logs.map(log => ({
          id: log.id,
          tableName: log.table_name,
          recordId: log.record_id,
          action: log.action,
          username: log.username,
          oldData: log.old_data,
          newData: log.new_data,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
          createdAt: log.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user audit logs',
      error: error.message
    });
  }
});

// GET /audit - Get all audit logs with filters
router.get('/', [
  query('tableName').optional().trim(),
  query('action').optional().isIn(['CREATE', 'UPDATE', 'DELETE', 'READ']),
  query('userId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { tableName, action, userId, startDate, endDate } = req.query;

    let queryText = `
      SELECT al.*, u.full_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (tableName) {
      queryText += ` AND al.table_name = $${paramCount++}`;
      queryParams.push(tableName);
    }
    if (action) {
      queryText += ` AND al.action = $${paramCount++}`;
      queryParams.push(action);
    }
    if (userId) {
      queryText += ` AND al.user_id = $${paramCount++}`;
      queryParams.push(userId);
    }
    if (startDate) {
      queryText += ` AND al.created_at >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    if (endDate) {
      queryText += ` AND al.created_at <= $${paramCount++}`;
      queryParams.push(endDate);
    }

    queryText += ` ORDER BY al.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(limit, offset);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (tableName) {
      countQuery += ` AND table_name = $${countParamCount++}`;
      countParams.push(tableName);
    }
    if (action) {
      countQuery += ` AND action = $${countParamCount++}`;
      countParams.push(action);
    }
    if (userId) {
      countQuery += ` AND user_id = $${countParamCount++}`;
      countParams.push(userId);
    }
    if (startDate) {
      countQuery += ` AND created_at >= $${countParamCount++}`;
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ` AND created_at <= $${countParamCount++}`;
      countParams.push(endDate);
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
        logs: result.rows.map(log => ({
          id: log.id,
          tableName: log.table_name,
          recordId: log.record_id,
          action: log.action,
          username: log.username,
          fullName: log.full_name,
          email: log.email,
          oldData: log.old_data,
          newData: log.new_data,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
          createdAt: log.created_at
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
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
});

export default router;

