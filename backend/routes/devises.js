const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, tenantMiddleware, checkPermission } = require('../middleware/auth');

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

// GET /api/devises - List all currencies
router.get('/', checkPermission('DEVISES', 'can_view'), async (req, res) => {
    try {
        const [devises] = await pool.query(
            'SELECT IDDevises, libelle, Symbole, TauxChangeDeviseCFA FROM devises ORDER BY libelle'
        );
        res.json(devises);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
