import express from 'express';
import { body, param, validationResult } from 'express-validator';
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

// GET /tna - Get all TNA with optional filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let queryText = `
      SELECT 
        t.id,
        t.terapis_id,
        t.no_dokumen,
        t.revisi,
        t.tgl_berlaku,
        t.unit,
        t.departement,
        t.created_at,
        t.updated_at,
        ter.nama as terapis_nama,
        ter.lulusan as terapis_lulusan
      FROM tna t
      LEFT JOIN terapis ter ON t.terapis_id = ter.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      queryText += ` AND (
        t.no_dokumen ILIKE $${paramCount} OR
        t.unit ILIKE $${paramCount} OR
        t.departement ILIKE $${paramCount} OR
        ter.nama ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(queryText, params);
    const countResult = await pool.query('SELECT COUNT(*) as count FROM tna');

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        terapisId: row.terapis_id,
        terapisNama: row.terapis_nama,
        terapisLulusan: row.terapis_lulusan,
        noDokumen: row.no_dokumen,
        revisi: row.revisi,
        tglBerlaku: row.tgl_berlaku,
        unit: row.unit,
        departement: row.departement,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching TNA list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch TNA list',
      error: error.message,
    });
  }
});

// GET /tna/terapis/:terapisId - Get TNA by terapis ID
router.get('/terapis/:terapisId', [
  param('terapisId').isUUID()
], validate, async (req, res) => {
  try {
    const { terapisId } = req.params;

    // Get TNA
    const tnaResult = await pool.query(
      'SELECT * FROM tna WHERE terapis_id = $1',
      [terapisId]
    );

    if (tnaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'TNA not found for this terapis'
      });
    }

    const tna = tnaResult.rows[0];

    // Get training rows
    const rowsResult = await pool.query(
      'SELECT * FROM tna_training_rows WHERE tna_id = $1 ORDER BY urutan',
      [tna.id]
    );

    // Get approval data
    const approvalResult = await pool.query(
      'SELECT * FROM tna_approval WHERE tna_id = $1',
      [tna.id]
    );

    res.json({
      success: true,
      data: {
        id: tna.id,
        terapisId: tna.terapis_id,
        noDokumen: tna.no_dokumen,
        revisi: tna.revisi,
        tglBerlaku: tna.tgl_berlaku,
        unit: tna.unit,
        departement: tna.departement,
        trainingRows: rowsResult.rows.map(row => ({
          id: row.id,
          jenisTopik: row.jenis_topik,
          alasan: row.alasan,
          peserta: row.peserta,
          rencanaPelaksanaan: row.rencana_pelaksanaan,
          budgetBiaya: row.budget_biaya,
          urutan: row.urutan
        })),
        approvalData: approvalResult.rows.length > 0 ? {
          diajukanOleh: approvalResult.rows[0].diajukan_oleh,
          direviewOleh: approvalResult.rows[0].direview_oleh,
          disetujuiOleh1: approvalResult.rows[0].disetujui_oleh_1,
          disetujuiOleh2: approvalResult.rows[0].disetujui_oleh_2
        } : null,
        createdAt: tna.created_at,
        updatedAt: tna.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching TNA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch TNA',
      error: error.message
    });
  }
});

// POST /tna - Create or update TNA
router.post('/', [
  body('terapisId').isUUID(),
  body('noDokumen').notEmpty().trim(),
  body('tglBerlaku').isISO8601().toDate(),
  body('unit').notEmpty().trim(),
  body('departement').notEmpty().trim(),
  body('trainingRows').isArray(),
  body('approvalData').optional().isObject()
], validate, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      terapisId,
      noDokumen,
      revisi = '0',
      tglBerlaku,
      unit,
      departement,
      trainingRows = [],
      approvalData = {}
    } = req.body;

    // Check if TNA exists
    const existingResult = await client.query(
      'SELECT id FROM tna WHERE terapis_id = $1',
      [terapisId]
    );

    let tnaId;
    if (existingResult.rows.length > 0) {
      // Update existing
      tnaId = existingResult.rows[0].id;
      await client.query(
        `UPDATE tna SET no_dokumen = $1, revisi = $2, tgl_berlaku = $3, unit = $4, departement = $5, updated_by = $6
         WHERE id = $7`,
        [noDokumen, revisi, tglBerlaku, unit, departement, req.user.id, tnaId]
      );
      
      // Delete existing rows
      await client.query('DELETE FROM tna_training_rows WHERE tna_id = $1', [tnaId]);
      await client.query('DELETE FROM tna_approval WHERE tna_id = $1', [tnaId]);
    } else {
      // Create new
      const tnaResult = await client.query(
        `INSERT INTO tna (terapis_id, no_dokumen, revisi, tgl_berlaku, unit, departement, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [terapisId, noDokumen, revisi, tglBerlaku, unit, departement, req.user.id]
      );
      tnaId = tnaResult.rows[0].id;
    }

    // Insert training rows
    for (let i = 0; i < trainingRows.length; i++) {
      const row = trainingRows[i];
      await client.query(
        `INSERT INTO tna_training_rows (tna_id, jenis_topik, alasan, peserta, rencana_pelaksanaan, budget_biaya, urutan)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tnaId, row.jenisTopik || null, row.alasan || null, row.peserta || null, 
         row.rencanaPelaksanaan || null, row.budgetBiaya || null, i + 1]
      );
    }

    // Insert approval data
    if (approvalData.diajukanOleh || approvalData.direviewOleh || 
        approvalData.disetujuiOleh1 || approvalData.disetujuiOleh2) {
      await client.query(
        `INSERT INTO tna_approval (tna_id, diajukan_oleh, direview_oleh, disetujui_oleh_1, disetujui_oleh_2)
         VALUES ($1, $2, $3, $4, $5)`,
        [tnaId, approvalData.diajukanOleh || null, approvalData.direviewOleh || null,
         approvalData.disetujuiOleh1 || null, approvalData.disetujuiOleh2 || null]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'TNA berhasil disimpan',
      data: { id: tnaId }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving TNA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save TNA',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// DELETE /tna/:id
router.delete('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tna WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'TNA not found'
      });
    }

    res.json({
      success: true,
      message: 'TNA berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting TNA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete TNA',
      error: error.message
    });
  }
});

export default router;

