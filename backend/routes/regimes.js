const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, tenantMiddleware, checkPermission } = require('../middleware/auth');

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

// GET /api/regimes - List all customs regimes
router.get('/', checkPermission('REGIMES', 'can_view'), async (req, res) => {
    try {
        const [regimes] = await pool.query(
            'SELECT IDRegimeDeclaration, CodeRegimeDeclaration, LibelleRegimeDeclaration FROM regimedeclaration ORDER BY CodeRegimeDeclaration'
        );
        res.json(regimes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
