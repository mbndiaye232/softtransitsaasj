const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, tenantMiddleware, checkPermission } = require('../middleware/auth');

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

// GET /api/taxes - List all taxes, optionally filtered by NTS
router.get('/', checkPermission('TAXES', 'can_view'), async (req, res) => {
    try {
        const { nts } = req.query;
        let query = 'SELECT * FROM taxes';
        const params = [];

        if (nts) {
            query = `
                SELECT DISTINCT t.*, tx.Taux
                FROM taxes t
                INNER JOIN tarifs tr ON t.CodeTaxe = tr.CodeTaxe
                LEFT JOIN taux tx ON tr.IDTaux = tx.IDTaux
                WHERE tr.NTS = ?
            `;
            params.push(nts);
        }

        query += ' ORDER BY CodeTaxe';

        const [taxes] = await pool.query(query, params);
        res.json(taxes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
