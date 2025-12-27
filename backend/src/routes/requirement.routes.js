import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

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

// GET /requirement - Get all requirements
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

    let queryText = 'SELECT * FROM requirement WHERE 1=1';
    const queryParams = [];

    if (search) {
      queryText += ' AND (nama ILIKE $1 OR lulusan ILIKE $1 OR jurusan ILIKE $1)';
      queryParams.push(`%${search}%`);
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    let countQuery = 'SELECT COUNT(*) FROM requirement WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (nama ILIKE $1 OR lulusan ILIKE $1 OR jurusan ILIKE $1)';
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
        requirements: result.rows.map(row => ({
          id: row.id,
          nama: row.nama,
          lulusan: row.lulusan,
          jurusan: row.jurusan,
          tanggalRequirement: row.tanggal_requirement,
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
    console.error('Error fetching requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requirements',
      error: error.message
    });
  }
});

// GET /requirement/:id
router.get('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM requirement WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        nama: row.nama,
        lulusan: row.lulusan,
        jurusan: row.jurusan,
        tanggalRequirement: row.tanggal_requirement,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requirement',
      error: error.message
    });
  }
});

// POST /requirement - Create new requirement
router.post('/', [
  body('nama').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('lulusan').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('jurusan').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('tanggalRequirement').isISO8601().toDate()
], validate, async (req, res) => {
  try {
    const { nama, lulusan, jurusan, tanggalRequirement } = req.body;

    const result = await pool.query(
      `INSERT INTO requirement (nama, lulusan, jurusan, tanggal_requirement, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nama, lulusan, jurusan, tanggalRequirement, req.user.id]
    );

    const row = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Requirement berhasil dibuat',
      data: {
        id: row.id,
        nama: row.nama,
        lulusan: row.lulusan,
        jurusan: row.jurusan,
        tanggalRequirement: row.tanggal_requirement,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create requirement',
      error: error.message
    });
  }
});

// POST /requirement/:id/accept - Accept requirement and move to terapis
router.post('/:id/accept', [
  param('id').isUUID(),
  body('cabang').optional().isIn(['Batu Aji', 'Tiban'])
], validate, async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get requirement
      const requirementResult = await client.query(
        'SELECT * FROM requirement WHERE id = $1',
        [req.params.id]
      );

      if (requirementResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Requirement not found'
        });
      }

      const requirement = requirementResult.rows[0];
      const { cabang } = req.body; // Get cabang from request body

      // Create terapis from requirement
      const terapisResult = await client.query(
        `INSERT INTO terapis (nama, lulusan, tanggal_requirement, cabang, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [requirement.nama, requirement.lulusan, requirement.tanggal_requirement, cabang || null, req.user.id]
      );

      // Delete requirement
      await client.query('DELETE FROM requirement WHERE id = $1', [req.params.id]);

      await client.query('COMMIT');

      const terapis = terapisResult.rows[0];
      res.json({
        success: true,
        message: 'Requirement telah diterima dan dipindahkan ke Data Terapis',
        data: {
          terapis: {
            id: terapis.id,
            nama: terapis.nama,
            lulusan: terapis.lulusan,
            tanggalRequirement: terapis.tanggal_requirement,
            cabang: terapis.cabang,
            createdAt: terapis.created_at
          }
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error accepting requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept requirement',
      error: error.message
    });
  }
});

// DELETE /requirement/:id - Reject/Delete requirement
router.delete('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM requirement WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    res.json({
      success: true,
      message: 'Requirement berhasil ditolak dan dihapus'
    });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete requirement',
      error: error.message
    });
  }
});

export default router;

