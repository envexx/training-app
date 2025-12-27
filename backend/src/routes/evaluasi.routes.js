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

// GET /evaluasi - Get all Evaluasi with optional filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let queryText = `
      SELECT 
        e.id,
        e.terapis_id,
        e.no_dokumen,
        e.revisi,
        e.tgl_berlaku,
        e.nama,
        e.departemen,
        e.nama_pelatihan,
        e.tgl_pelaksanaan,
        e.created_at,
        e.updated_at,
        ter.nama as terapis_nama,
        ter.lulusan as terapis_lulusan
      FROM evaluasi e
      LEFT JOIN terapis ter ON e.terapis_id = ter.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      queryText += ` AND (
        e.no_dokumen ILIKE $${paramCount} OR
        e.nama ILIKE $${paramCount} OR
        e.departemen ILIKE $${paramCount} OR
        e.nama_pelatihan ILIKE $${paramCount} OR
        ter.nama ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += ` ORDER BY e.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(queryText, params);
    const countResult = await pool.query('SELECT COUNT(*) as count FROM evaluasi');

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
        nama: row.nama,
        departemen: row.departemen,
        namaPelatihan: row.nama_pelatihan,
        tglPelaksanaan: row.tgl_pelaksanaan,
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
    console.error('Error fetching Evaluasi list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Evaluasi list',
      error: error.message,
    });
  }
});

// GET /evaluasi/terapis/:terapisId
router.get('/terapis/:terapisId', [
  param('terapisId').isUUID()
], validate, async (req, res) => {
  try {
    const { terapisId } = req.params;

    const evaluasiResult = await pool.query(
      'SELECT * FROM evaluasi WHERE terapis_id = $1',
      [terapisId]
    );

    if (evaluasiResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluasi not found for this terapis'
      });
    }

    const evaluasi = evaluasiResult.rows[0];

    // Get related data
    const [tujuanResult, proficiencyResult, harapanResult] = await Promise.all([
      pool.query('SELECT * FROM evaluasi_tujuan_pelatihan WHERE evaluasi_id = $1 ORDER BY urutan', [evaluasi.id]),
      pool.query('SELECT * FROM evaluasi_proficiency WHERE evaluasi_id = $1 ORDER BY urutan', [evaluasi.id]),
      pool.query('SELECT * FROM evaluasi_harapan_komentar WHERE evaluasi_id = $1 ORDER BY urutan', [evaluasi.id])
    ]);

    res.json({
      success: true,
      data: {
        id: evaluasi.id,
        terapisId: evaluasi.terapis_id,
        noDokumen: evaluasi.no_dokumen,
        revisi: evaluasi.revisi,
        tglBerlaku: evaluasi.tgl_berlaku,
        nama: evaluasi.nama,
        departemen: evaluasi.departemen,
        divisi: evaluasi.divisi,
        jabatan: evaluasi.jabatan,
        tglPelaksanaan: evaluasi.tgl_pelaksanaan,
        sifatPelatihan: {
          general: evaluasi.sifat_pelatihan_general,
          technical: evaluasi.sifat_pelatihan_technical,
          managerial: evaluasi.sifat_pelatihan_managerial
        },
        namaPelatihan: evaluasi.nama_pelatihan,
        tempat: evaluasi.tempat,
        tanggal: evaluasi.tanggal,
        yangMenilai: evaluasi.yang_menilai,
        tujuanPelatihan: tujuanResult.rows.map(r => r.tujuan),
        proficiencyRows: proficiencyResult.rows.map(r => ({
          pengetahuan: r.pengetahuan,
          keterampilan: r.keterampilan,
          sebelum: r.sebelum,
          sesudah: r.sesudah
        })),
        harapanKomentar: harapanResult.rows.map(r => r.harapan_komentar),
        createdAt: evaluasi.created_at,
        updatedAt: evaluasi.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching Evaluasi:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Evaluasi',
      error: error.message
    });
  }
});

// POST /evaluasi
router.post('/', [
  body('terapisId').isUUID(),
  body('noDokumen').notEmpty().trim(),
  body('tglBerlaku').isISO8601().toDate(),
  body('nama').notEmpty().trim(),
  body('departemen').notEmpty().trim(),
  body('tujuanPelatihan').isArray().isLength({ min: 0, max: 5 }),
  body('proficiencyRows').isArray().isLength({ min: 0, max: 5 }),
  body('harapanKomentar').isArray().isLength({ min: 0, max: 5 })
], validate, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      terapisId,
      noDokumen,
      revisi = '0',
      tglBerlaku,
      nama,
      departemen,
      divisi,
      jabatan,
      tglPelaksanaan,
      sifatPelatihan = {},
      namaPelatihan,
      tempat = 'Mojokerto',
      tanggal,
      yangMenilai,
      tujuanPelatihan = [],
      proficiencyRows = [],
      harapanKomentar = []
    } = req.body;

    // Check if exists
    const existingResult = await client.query(
      'SELECT id FROM evaluasi WHERE terapis_id = $1',
      [terapisId]
    );

    let evaluasiId;
    if (existingResult.rows.length > 0) {
      evaluasiId = existingResult.rows[0].id;
      await client.query(
        `UPDATE evaluasi SET no_dokumen = $1, revisi = $2, tgl_berlaku = $3, nama = $4,
         departemen = $5, divisi = $6, jabatan = $7, tgl_pelaksanaan = $8,
         sifat_pelatihan_general = $9, sifat_pelatihan_technical = $10, sifat_pelatihan_managerial = $11,
         nama_pelatihan = $12, tempat = $13, tanggal = $14, yang_menilai = $15, updated_by = $16
         WHERE id = $17`,
        [noDokumen, revisi, tglBerlaku, nama, departemen, divisi || null, jabatan || null,
         tglPelaksanaan || null, sifatPelatihan.general || false, sifatPelatihan.technical || false,
         sifatPelatihan.managerial || false, namaPelatihan || null, tempat, tanggal || null,
         yangMenilai || null, req.user.id, evaluasiId]
      );
      
      // Delete existing related data
      await Promise.all([
        client.query('DELETE FROM evaluasi_tujuan_pelatihan WHERE evaluasi_id = $1', [evaluasiId]),
        client.query('DELETE FROM evaluasi_proficiency WHERE evaluasi_id = $1', [evaluasiId]),
        client.query('DELETE FROM evaluasi_harapan_komentar WHERE evaluasi_id = $1', [evaluasiId])
      ]);
    } else {
      const evaluasiResult = await client.query(
        `INSERT INTO evaluasi (terapis_id, no_dokumen, revisi, tgl_berlaku, nama, departemen,
         divisi, jabatan, tgl_pelaksanaan, sifat_pelatihan_general, sifat_pelatihan_technical,
         sifat_pelatihan_managerial, nama_pelatihan, tempat, tanggal, yang_menilai, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
        [terapisId, noDokumen, revisi, tglBerlaku, nama, departemen, divisi || null,
         jabatan || null, tglPelaksanaan || null, sifatPelatihan.general || false,
         sifatPelatihan.technical || false, sifatPelatihan.managerial || false,
         namaPelatihan || null, tempat, tanggal || null, yangMenilai || null, req.user.id]
      );
      evaluasiId = evaluasiResult.rows[0].id;
    }

    // Insert tujuan pelatihan
    for (let i = 0; i < tujuanPelatihan.length; i++) {
      await client.query(
        'INSERT INTO evaluasi_tujuan_pelatihan (evaluasi_id, urutan, tujuan) VALUES ($1, $2, $3)',
        [evaluasiId, i + 1, tujuanPelatihan[i] || null]
      );
    }

    // Insert proficiency rows
    for (let i = 0; i < proficiencyRows.length; i++) {
      const row = proficiencyRows[i];
      await client.query(
        `INSERT INTO evaluasi_proficiency (evaluasi_id, urutan, pengetahuan, keterampilan, sebelum, sesudah)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [evaluasiId, i + 1, row.pengetahuan || null, row.keterampilan || null,
         row.sebelum || null, row.sesudah || null]
      );
    }

    // Insert harapan komentar
    for (let i = 0; i < harapanKomentar.length; i++) {
      await client.query(
        'INSERT INTO evaluasi_harapan_komentar (evaluasi_id, urutan, harapan_komentar) VALUES ($1, $2, $3)',
        [evaluasiId, i + 1, harapanKomentar[i] || null]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Evaluasi berhasil disimpan',
      data: { id: evaluasiId }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving Evaluasi:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save Evaluasi',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// DELETE /evaluasi/:id
router.delete('/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM evaluasi WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluasi not found'
      });
    }

    res.json({
      success: true,
      message: 'Evaluasi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting Evaluasi:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Evaluasi',
      error: error.message
    });
  }
});

export default router;

