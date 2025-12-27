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

// GET /training/modules - Get training modules with filters
router.get('/modules', [
  query('year').optional().isInt(),
  query('category').optional().isIn(['BASIC', 'TECHNICAL', 'MANAGERIAL', 'HSE'])
], validate, async (req, res) => {
  try {
    const { year, category } = req.query;
    
    let queryText = 'SELECT * FROM training_modules WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (year) {
      queryText += ` AND year = $${paramCount++}`;
      params.push(parseInt(year));
    }
    if (category) {
      queryText += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    queryText += ' ORDER BY year DESC, category, module_name';

    const result = await pool.query(queryText, params);

    // Get scheduled weeks for each module
    const modules = await Promise.all(
      result.rows.map(async (module) => {
        const weeksResult = await pool.query(
          'SELECT week_number FROM training_scheduled_weeks WHERE module_id = $1 ORDER BY week_number',
          [module.id]
        );
        return {
          id: module.id,
          category: module.category,
          moduleName: module.module_name,
          durasi: module.durasi,
          classField: module.class_field,
          trainer: module.trainer,
          targetTrainee: module.target_trainee,
          year: module.year,
          weeks: weeksResult.rows.map(r => r.week_number),
          createdAt: module.created_at,
          updatedAt: module.updated_at
        };
      })
    );

    res.json({
      success: true,
      data: { modules }
    });
  } catch (error) {
    console.error('Error fetching training modules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training modules',
      error: error.message
    });
  }
});

// GET /training/modules/:id
router.get('/modules/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM training_modules WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Training module not found'
      });
    }

    const module = result.rows[0];
    const weeksResult = await pool.query(
      'SELECT week_number FROM training_scheduled_weeks WHERE module_id = $1 ORDER BY week_number',
      [module.id]
    );

    res.json({
      success: true,
      data: {
        id: module.id,
        category: module.category,
        moduleName: module.module_name,
        durasi: module.durasi,
        classField: module.class_field,
        trainer: module.trainer,
        targetTrainee: module.target_trainee,
        year: module.year,
        weeks: weeksResult.rows.map(r => r.week_number),
        createdAt: module.created_at,
        updatedAt: module.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching training module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training module',
      error: error.message
    });
  }
});

// POST /training/modules
router.post('/modules', [
  body('category').isIn(['BASIC', 'TECHNICAL', 'MANAGERIAL', 'HSE']),
  body('moduleName').notEmpty().trim(),
  body('year').isInt(),
  body('targetTrainee').isIn(['P', 'A']),
  body('weeks').optional().isArray()
], validate, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      category,
      moduleName,
      durasi,
      classField,
      trainer,
      targetTrainee,
      year,
      weeks = [],
      scheduledWeeks = [] // Support both 'weeks' and 'scheduledWeeks' for compatibility
    } = req.body;
    
    // Use scheduledWeeks if provided, otherwise use weeks
    const weeksToSave = scheduledWeeks.length > 0 ? scheduledWeeks : weeks;

    const moduleResult = await client.query(
      `INSERT INTO training_modules (category, module_name, durasi, class_field, trainer, target_trainee, year, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [category, moduleName, durasi || null, classField || null, trainer || null, targetTrainee, year, req.user.id]
    );

    const moduleId = moduleResult.rows[0].id;

    // Insert scheduled weeks
    for (const week of weeksToSave) {
      if (week >= 1 && week <= 52) {
        await client.query(
          'INSERT INTO training_scheduled_weeks (module_id, week_number) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [moduleId, week]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Training module berhasil dibuat',
      data: { id: moduleId }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating training module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create training module',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// PUT /training/modules/:id
router.put('/modules/:id', [
  param('id').isUUID(),
  body('category').optional().isIn(['BASIC', 'TECHNICAL', 'MANAGERIAL', 'HSE']),
  body('moduleName').optional().notEmpty().trim(),
  body('targetTrainee').optional().isIn(['P', 'A']),
  body('weeks').optional().isArray()
], validate, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const {
      category,
      moduleName,
      durasi,
      classField,
      trainer,
      targetTrainee,
      weeks,
      scheduledWeeks // Support both 'weeks' and 'scheduledWeeks' for compatibility
    } = req.body;
    
    // Use scheduledWeeks if provided, otherwise use weeks
    const weeksToUpdate = scheduledWeeks !== undefined ? scheduledWeeks : weeks;

    // Update module
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (moduleName !== undefined) {
      updates.push(`module_name = $${paramCount++}`);
      values.push(moduleName);
    }
    if (durasi !== undefined) {
      updates.push(`durasi = $${paramCount++}`);
      values.push(durasi);
    }
    if (classField !== undefined) {
      updates.push(`class_field = $${paramCount++}`);
      values.push(classField);
    }
    if (trainer !== undefined) {
      updates.push(`trainer = $${paramCount++}`);
      values.push(trainer);
    }
    if (targetTrainee !== undefined) {
      updates.push(`target_trainee = $${paramCount++}`);
      values.push(targetTrainee);
    }

    if (updates.length > 0) {
      // Always add updated_by
      updates.push(`updated_by = $${paramCount++}`);
      values.push(req.user.id);
      values.push(id);
      await client.query(
        `UPDATE training_modules SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }

    // Update weeks if provided
    if (weeksToUpdate !== undefined) {
      // Delete existing weeks
      await client.query('DELETE FROM training_scheduled_weeks WHERE module_id = $1', [id]);
      
      // Insert new weeks
      for (const week of weeksToUpdate) {
        if (week >= 1 && week <= 52) {
          await client.query(
            'INSERT INTO training_scheduled_weeks (module_id, week_number) VALUES ($1, $2)',
            [id, week]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Training module berhasil diupdate'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating training module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update training module',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// DELETE /training/modules/:id
router.delete('/modules/:id', [
  param('id').isUUID()
], validate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM training_modules WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Training module not found'
      });
    }

    res.json({
      success: true,
      message: 'Training module berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting training module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete training module',
      error: error.message
    });
  }
});

export default router;

