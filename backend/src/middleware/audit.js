import pool from '../config/database.js';

/**
 * Middleware untuk logging audit trail
 * Mencatat semua operasi CREATE, UPDATE, DELETE
 */
export const auditLog = async (req, res, next) => {
  // Store original methods
  const originalSend = res.json;
  const originalStatus = res.status;

  // Override res.json to capture response
  res.json = function (data) {
    // Log after response is sent
    if (req.user && req.method !== 'GET') {
      logAudit(req, data).catch(err => {
        console.error('Audit log error:', err);
      });
    }
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Log audit trail untuk operasi CRUD
 */
async function logAudit(req, responseData) {
  try {
    if (!req.user) return;

    const { method, path, body, params, query } = req;
    const userId = req.user.id;
    const username = req.user.username;

    // Determine action and table name from route
    let action = '';
    let tableName = '';
    let recordId = null;
    let oldData = null;
    let newData = null;

    // Extract table name from path
    const pathParts = path.split('/');
    const apiIndex = pathParts.findIndex(p => p === 'api');
    if (apiIndex >= 0 && pathParts.length > apiIndex + 2) {
      tableName = pathParts[apiIndex + 2]; // e.g., /api/v1/terapis -> terapis
    }

    // Determine action from HTTP method
    if (method === 'POST') {
      action = 'CREATE';
      recordId = responseData?.data?.id || params.id || body.id;
      newData = body;
    } else if (method === 'PUT' || method === 'PATCH') {
      action = 'UPDATE';
      recordId = params.id;
      newData = body;
      // Try to get old data if available (would need to fetch before update)
    } else if (method === 'DELETE') {
      action = 'DELETE';
      recordId = params.id;
      // Store deleted data if available in response
      if (responseData?.data) {
        oldData = responseData.data;
      }
    } else {
      return; // Don't log GET requests
    }

    // Skip if no table name or record ID
    if (!tableName || !recordId) return;

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Insert audit log
    await pool.query(
      `INSERT INTO audit_logs (table_name, record_id, action, user_id, username, old_data, new_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        tableName,
        recordId,
        action,
        userId,
        username,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    // Don't throw error, just log it
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper function untuk log audit secara manual
 * Digunakan untuk operasi kompleks yang tidak bisa di-capture oleh middleware
 */
export const logAuditManual = async ({
  tableName,
  recordId,
  action,
  userId,
  username,
  oldData = null,
  newData = null,
  ipAddress = null,
  userAgent = null
}) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (table_name, record_id, action, user_id, username, old_data, new_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        tableName,
        recordId,
        action,
        userId,
        username,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    console.error('Failed to create manual audit log:', error);
  }
};

/**
 * Get audit logs for a specific record
 */
export const getAuditLogs = async (tableName, recordId, limit = 50) => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.full_name, u.email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.table_name = $1 AND al.record_id = $2
       ORDER BY al.created_at DESC
       LIMIT $3`,
      [tableName, recordId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return [];
  }
};

/**
 * Get audit logs for a user
 */
export const getUserAuditLogs = async (userId, limit = 100) => {
  try {
    const result = await pool.query(
      `SELECT al.*
       FROM audit_logs al
       WHERE al.user_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to get user audit logs:', error);
    return [];
  }
};

