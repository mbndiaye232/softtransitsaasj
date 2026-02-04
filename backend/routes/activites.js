const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, tenantMiddleware } = require('../middleware/auth');

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/activites
 * List all activities for the current tenant
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM activites WHERE structur_id = ? ORDER BY libelle',
            [req.structur_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

module.exports = router;
