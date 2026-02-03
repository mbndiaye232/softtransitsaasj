const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, tenantMiddleware, checkPermission } = require('../middleware/auth');

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/pays
 * Get all countries
 */
router.get('/', checkPermission('PAYS', 'can_view'), async (req, res) => {
    try {
        const [countries] = await pool.query(
            'SELECT IDPays, NomPays, codePays3, CodePays2 FROM Pays ORDER BY NomPays ASC'
        );
        res.json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

module.exports = router;
