import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation middleware
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

// GET /terapis - Get all terapis with pagination and search
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('cabang').optional().trim().isIn(['Batu Aji', 'Tiban']).withMessage('Cabang must be either "Batu Aji" or "Tiban"')
], validate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const cabang = req.query.cabang ? String(req.query.cabang).trim() : '';

    console.log('GET /terapis - Query params:', { page, limit, search, cabang });

    let queryText = 'SELECT * FROM terapis WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (search) {
      queryText += ` AND (nama ILIKE $${paramCount} OR lulusan ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (cabang && cabang !== '') {
      queryText += ` AND cabang = $${paramCount}`;
      queryParams.push(cabang);
      paramCount++;
      console.log('Filtering by cabang:', cabang);
    }

    console.log('SQL Query:', queryText);
    console.log('Query Params:', queryParams);

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM terapis WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;
    
    if (search) {
      countQuery += ` AND (nama ILIKE $${countParamCount} OR lulusan ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }
    
    if (cabang && cabang !== '') {
      countQuery += ` AND cabang = $${countParamCount}`;
      countParams.push(cabang);
      countParamCount++;
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
        terapis: result.rows.map(row => ({
          id: row.id,
          nama: row.nama,
          lulusan: row.lulusan,
          tanggalRequirement: row.tanggal_requirement,
          cabang: row.cabang,
          mulaiKontrak: row.mulai_kontrak,
          endKontrak: row.end_kontrak,
          alamat: row.alamat,
          noTelp: row.no_telp,
          email: row.email,
          createdBy: row.created_by,
          updatedBy: row.updated_by,
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
    console.error('Error fetching terapis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terapis',
      error: error.message
    });
  }
});

// GET /terapis/:id - Get terapis by ID
router.get('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM terapis WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Terapis not found'
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        nama: row.nama,
        lulusan: row.lulusan,
        tanggalRequirement: row.tanggal_requirement,
        cabang: row.cabang,
        mulaiKontrak: row.mulai_kontrak,
        endKontrak: row.end_kontrak,
        alamat: row.alamat,
        noTelp: row.no_telp,
        email: row.email,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching terapis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terapis',
      error: error.message
    });
  }
});

// POST /terapis - Create new terapis
router.post('/', [
  body('nama').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('lulusan').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('tanggalRequirement').isISO8601().toDate(),
  body('cabang').optional().isIn(['Batu Aji', 'Tiban']),
  body('mulaiKontrak').optional().isISO8601().toDate(),
  body('endKontrak').optional().isISO8601().toDate(),
  body('alamat').optional().isString().trim(),
  body('noTelp').optional().isString().trim().isLength({ max: 50 }),
  body('email').optional().isEmail().normalizeEmail()
], validate, async (req, res) => {
  try {
    const {
      nama,
      lulusan,
      tanggalRequirement,
      cabang,
      mulaiKontrak,
      endKontrak,
      alamat,
      noTelp,
      email
    } = req.body;

    const result = await pool.query(
      `INSERT INTO terapis (
        nama, lulusan, tanggal_requirement, cabang, mulai_kontrak, end_kontrak,
        alamat, no_telp, email, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [nama, lulusan, tanggalRequirement, cabang || null, mulaiKontrak || null, endKontrak || null, alamat || null, noTelp || null, email || null, req.user.id]
    );

    const row = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Terapis berhasil dibuat',
      data: {
        id: row.id,
        nama: row.nama,
        lulusan: row.lulusan,
        tanggalRequirement: row.tanggal_requirement,
        cabang: row.cabang,
        mulaiKontrak: row.mulai_kontrak,
        endKontrak: row.end_kontrak,
        alamat: row.alamat,
        noTelp: row.no_telp,
        email: row.email,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating terapis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create terapis',
      error: error.message
    });
  }
});

// PUT /terapis/:id - Update terapis
router.put('/:id', [
  param('id').isUUID(),
  body('nama').optional().notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('lulusan').optional().notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('tanggalRequirement').optional().isISO8601().toDate(),
  body('cabang').optional().isIn(['Batu Aji', 'Tiban']),
  body('mulaiKontrak').optional().isISO8601().toDate(),
  body('endKontrak').optional().isISO8601().toDate(),
  body('alamat').optional().isString().trim(),
  body('noTelp').optional().isString().trim().isLength({ max: 50 }),
  body('email').optional().isEmail().normalizeEmail()
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama,
      lulusan,
      tanggalRequirement,
      cabang,
      mulaiKontrak,
      endKontrak,
      alamat,
      noTelp,
      email
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nama !== undefined) {
      updates.push(`nama = $${paramCount++}`);
      values.push(nama);
    }
    if (lulusan !== undefined) {
      updates.push(`lulusan = $${paramCount++}`);
      values.push(lulusan);
    }
    if (tanggalRequirement !== undefined) {
      updates.push(`tanggal_requirement = $${paramCount++}`);
      values.push(tanggalRequirement);
    }
    if (cabang !== undefined) {
      updates.push(`cabang = $${paramCount++}`);
      values.push(cabang || null);
    }
    if (mulaiKontrak !== undefined) {
      updates.push(`mulai_kontrak = $${paramCount++}`);
      values.push(mulaiKontrak);
    }
    if (endKontrak !== undefined) {
      updates.push(`end_kontrak = $${paramCount++}`);
      values.push(endKontrak);
    }
    if (alamat !== undefined) {
      updates.push(`alamat = $${paramCount++}`);
      values.push(alamat);
    }
    if (noTelp !== undefined) {
      updates.push(`no_telp = $${paramCount++}`);
      values.push(noTelp);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
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
    const queryText = `UPDATE terapis SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Terapis not found'
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      message: 'Terapis berhasil diupdate',
      data: {
        id: row.id,
        nama: row.nama,
        lulusan: row.lulusan,
        tanggalRequirement: row.tanggal_requirement,
        cabang: row.cabang,
        mulaiKontrak: row.mulai_kontrak,
        endKontrak: row.end_kontrak,
        alamat: row.alamat,
        noTelp: row.no_telp,
        email: row.email,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating terapis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update terapis',
      error: error.message
    });
  }
});

// DELETE /terapis/:id - Delete terapis (CASCADE will delete related TNA and Evaluasi)
router.delete('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM terapis WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Terapis not found'
      });
    }

    res.json({
      success: true,
      message: 'Terapis berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting terapis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete terapis',
      error: error.message
    });
  }
});

export default router;

