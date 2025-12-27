import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const userResult = await pool.query(
        `SELECT u.*, r.name as role_name, r.permissions, r.is_system
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1 AND u.is_active = TRUE`,
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      req.user = {
        id: userResult.rows[0].id,
        username: userResult.rows[0].username,
        email: userResult.rows[0].email,
        fullName: userResult.rows[0].full_name,
        roleId: userResult.rows[0].role_id,
        roleName: userResult.rows[0].role_name,
        permissions: userResult.rows[0].permissions,
        isSystem: userResult.rows[0].is_system
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.roleName !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware to check custom permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    const permissions = req.user.permissions || {};
    
    // Admin has all permissions
    if (req.user.roleName === 'admin' || permissions.all === true) {
      return next();
    }

    // Check specific permission
    if (permissions[permission] === true) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Permission '${permission}' required`
    });
  };
};

// Helper function to generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

export { JWT_SECRET };

