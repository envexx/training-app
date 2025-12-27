import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /statistics - Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    // Get counts from all tables
    const [requirementCount, terapisCount, tnaCount, evaluasiCount, trainingCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM requirement'),
      pool.query('SELECT COUNT(*) as count FROM terapis'),
      pool.query('SELECT COUNT(*) as count FROM tna'),
      pool.query('SELECT COUNT(*) as count FROM evaluasi'),
      pool.query('SELECT COUNT(*) as count FROM training_modules'),
    ]);

    // Get TNA by month (last 6 months)
    const tnaByMonth = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM tna
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `);

    // Get Evaluasi by month (last 6 months)
    const evaluasiByMonth = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM evaluasi
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `);

    // Get Terapis by status (with/without contract)
    const terapisByStatus = await pool.query(`
      SELECT 
        CASE 
          WHEN mulai_kontrak IS NOT NULL AND end_kontrak IS NOT NULL THEN 'Aktif'
          WHEN mulai_kontrak IS NOT NULL AND end_kontrak IS NULL THEN 'Kontrak Berjalan'
          ELSE 'Belum Kontrak'
        END as status,
        COUNT(*) as count
      FROM terapis
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        counts: {
          requirement: parseInt(requirementCount.rows[0].count),
          terapis: parseInt(terapisCount.rows[0].count),
          tna: parseInt(tnaCount.rows[0].count),
          evaluasi: parseInt(evaluasiCount.rows[0].count),
          training: parseInt(trainingCount.rows[0].count),
        },
        charts: {
          tnaByMonth: tnaByMonth.rows.map(row => ({
            month: row.month,
            count: parseInt(row.count),
          })),
          evaluasiByMonth: evaluasiByMonth.rows.map(row => ({
            month: row.month,
            count: parseInt(row.count),
          })),
          terapisByStatus: terapisByStatus.rows.map(row => ({
            status: row.status,
            count: parseInt(row.count),
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
});

export default router;

