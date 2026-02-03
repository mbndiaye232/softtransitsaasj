// backend/routes/dossiers.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { body, validationResult } = require('express-validator');
const { authMiddleware, tenantMiddleware, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/upload');
const auditService = require('../services/auditService');

// Apply middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Helper to generate full code
function generateFullCode(nature, mode, type, year, increment) {
    const incStr = String(increment).padStart(5, '0');
    return `${nature}-${mode}-${type}-${year}-${incStr}`;
}

// Helper to generate short code (e.g., IMA-03-00002)
function generateShortCode(nature, mode, year, increment) {
    const natureLetter = nature.startsWith('IMP') ? 'I' : 'E';
    const modePart = mode; // MA, AE, TE
    const yearPart = String(year).slice(-2);
    const incStr = String(increment).padStart(5, '0');
    return `${natureLetter}${modePart}-${yearPart}-${incStr}`;
}

// Auto-select document type based on mode
function getDocumentType(mode) {
    if (mode === 'MA') return 'BL';
    if (mode === 'AE') return 'LTA';
    if (mode === 'TE') return 'LVI';
    return null;
}

// Middleware for validation
const dossierValidation = [
    body('label').notEmpty().withMessage('Label is required'),
    body('nature').isIn(['IMP', 'EXP']).withMessage('Nature must be IMP or EXP'),
    body('mode').isIn(['MA', 'AE', 'TE']).withMessage('Mode must be MA, AE, or TE'),
    body('type').isIn(['TC', 'GR', 'CO']).withMessage('Type must be TC, GR, or CO'),
    body('description').optional().isString(),
];

/**
 * GET /api/dossiers
 * List all dossiers for the tenant (or all for provider)
 */
router.get('/', checkPermission('DOSSIERS', 'can_view'), async (req, res) => {
    try {
        let query = `
            SELECT 
                d.IDDossiers as id, 
                d.IDCLIENTS as clientId, 
                c.NomRS as clientName,
                d.Libelle as label, 
                d.CodeDossier as code, 
                d.CodeDossierCourt as shortCode, 
                d.NatureDossier as nature, 
                d.ModeExpedition as mode, 
                d.TypeDossier as type, 
                d.Typedocument as documentType, 
                d.DescriptionDossiers as description, 
                d.NumeroDPI as dpiNumber, 
                d.EtapeCotation as quotationStep, 
                d.SaisiLe as createdAt,
                CASE WHEN d.IdEtapeDossiers = 7 THEN 'CLOSED' ELSE 'OPEN' END as status,
                s.NomSociete as company_name
            FROM dossiers d
            JOIN structur s ON d.structur_id = s.IDSociete
            LEFT JOIN CLIENTS c ON d.IDCLIENTS = c.IDCLIENTS
        `;
        let params = [];

        if (!req.is_viewing_all) {
            query += ' WHERE d.structur_id = ?';
            params.push(req.structur_id);
        }

        query += ' ORDER BY d.SaisiLe DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('List dossiers error:', err);
        res.status(500).json({ error: 'Failed to fetch dossiers' });
    }
});

/**
 * POST /api/dossiers
 * Create a new dossier
 */
router.post('/', checkPermission('DOSSIERS', 'can_create'), upload.single('file'), dossierValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { label, nature, mode, type, description, clientId, dpiNumber, quotationStep, contactName, contactPhone, contactEmail, observations } = req.body;

    if (!clientId) {
        return res.status(400).json({ error: 'Veuillez sélectionner un client' });
    }

    const fileUrl = req.file ? `/uploads/dossiers/${req.file.filename}` : null;
    const year = new Date().getFullYear();

    try {
        // Determine next increment
        const [rows] = await pool.query(
            `SELECT MAX(CAST(SUBSTRING_INDEX(CodeDossier, '-', -1) AS UNSIGNED)) as maxInc 
             FROM dossiers 
             WHERE NatureDossier = ? AND ModeExpedition = ? AND TypeDossier = ? 
             AND YEAR(SaisiLe) = ?`,
            [nature, mode, type, year]
        );
        const nextInc = (rows[0].maxInc || 0) + 1;
        const code = generateFullCode(nature, mode, type, year, nextInc);
        const shortCode = generateShortCode(nature, mode, year, nextInc);
        const documentType = getDocumentType(mode);

        const [result] = await pool.query(
            `INSERT INTO dossiers (
                IDCLIENTS, Libelle, CodeDossier, CodeDossierCourt, NatureDossier, ModeExpedition, TypeDossier,
                Typedocument, DescriptionDossiers, NumeroDPI, EtapeCotation, PersonneContact, 
                TelPersonneContact, EmailPersonneContact, Observations, cheminfiche, IdAgentValidation,
                Facturable, SaisiLe, IdEtapeDossiers, structur_id, IdAgentSaisi, IdAgModiff
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), 1, ?, ?, ?)`,
            [
                clientId || null, label, code, shortCode, nature, mode, type,
                documentType, description || null, dpiNumber || null, quotationStep ? 1 : 0,
                contactName || null, contactPhone || null, contactEmail || null, observations || null,
                fileUrl, req.user.id, req.structur_id, req.user.id, req.user.id
            ]
        );

        await auditService.log({
            agent_id: req.user.id,
            structur_id: req.user.structur_id,
            action: 'CREATE',
            resource_type: 'DOSSIER',
            resource_id: result.insertId,
            details: { code, label, clientId },
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        res.status(201).json({ id: result.insertId, code, shortCode, documentType });
    } catch (err) {
        console.error('Create dossier error:', err);
        res.status(500).json({ error: 'Failed to create dossier', details: err.message });
    }
});

/**
 * GET /api/dossiers/:id
 * Retrieve a dossier
 */
router.get('/:id', checkPermission('DOSSIERS', 'can_view'), async (req, res) => {
    try {
        let query = `
            SELECT IDDossiers as id, IDCLIENTS as clientId, Libelle as label, CodeDossier as code, 
                    CodeDossierCourt as shortCode, NatureDossier as nature, ModeExpedition as mode, 
                    TypeDossier as type, Typedocument as documentType, DescriptionDossiers as description,
                    NumeroDPI as dpiNumber, EtapeCotation as quotationStep, PersonneContact as contactName,
                    TelPersonneContact as contactPhone, EmailPersonneContact as contactEmail,
                    Observations as observations, cheminfiche as fileUrl, IdAgentValidation as validatedByAgentId,
                    Facturable as isFacturable, SaisiLe as createdAt
             FROM dossiers WHERE IDDossiers = ?
        `;
        let params = [req.params.id];

        if (!req.user.is_provider) {
            query += ' AND structur_id = ?';
            params.push(req.structur_id);
        }

        const [rows] = await pool.query(query, params);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Dossier not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Get dossier error:', err);
        res.status(500).json({ error: 'Failed to fetch dossier' });
    }
});

/**
 * PUT /api/dossiers/:id
 * Update a dossier
 */
router.put('/:id', checkPermission('DOSSIERS', 'can_edit'), upload.single('file'), dossierValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { label, nature, mode, type, description, editCode, isFacturable, clientId, dpiNumber, quotationStep, contactName, contactPhone, contactEmail, observations } = req.body;
    const fileUrl = req.file ? `/uploads/dossiers/${req.file.filename}` : undefined;

    try {
        let query = `SELECT * FROM dossiers WHERE IDDossiers = ?`;
        let params = [req.params.id];
        if (!req.user.is_provider) {
            query += ' AND structur_id = ?';
            params.push(req.structur_id);
        }

        const [exist] = await pool.query(query, params);
        if (exist.length === 0) {
            return res.status(404).json({ error: 'Dossier not found' });
        }

        const dossier = exist[0];
        let newCode = dossier.CodeDossier;
        let newShortCode = dossier.CodeDossierCourt;
        let newDocumentType = dossier.Typedocument;

        if (editCode === 'true' || editCode === true) {
            const year = new Date(dossier.SaisiLe).getFullYear();
            const increment = parseInt(dossier.CodeDossier.split('-').pop());
            newCode = generateFullCode(nature, mode, type, year, increment);
            newShortCode = generateShortCode(nature, mode, year, increment);
            newDocumentType = getDocumentType(mode);
        }

        let updateQuery = `UPDATE dossiers SET Libelle = ?, NatureDossier = ?, ModeExpedition = ?, TypeDossier = ?, DescriptionDossiers = ?, CodeDossier = ?, CodeDossierCourt = ?, Typedocument = ?, Facturable = ?, IDCLIENTS = ?, NumeroDPI = ?, EtapeCotation = ?, PersonneContact = ?, TelPersonneContact = ?, EmailPersonneContact = ?, Observations = ?, IdAgModiff = ?`;
        let updateParams = [label, nature, mode, type, description || null, newCode, newShortCode, newDocumentType, isFacturable ? 1 : 0, clientId || null, dpiNumber || null, quotationStep ? 1 : 0, contactName || null, contactPhone || null, contactEmail || null, observations || null, req.user.id];

        if (fileUrl) {
            updateQuery += `, cheminfiche = ?`;
            updateParams.push(fileUrl);
        }

        updateQuery += ` WHERE IDDossiers = ?`;
        updateParams.push(req.params.id);

        await pool.query(updateQuery, updateParams);

        await auditService.log({
            agent_id: req.user.id,
            structur_id: req.user.structur_id,
            action: 'UPDATE',
            resource_type: 'DOSSIER',
            resource_id: req.params.id,
            details: { code: newCode, label },
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        res.json({ message: 'Dossier updated successfully' });
    } catch (err) {
        console.error('Update dossier error:', err);
        res.status(500).json({ error: 'Failed to update dossier' });
    }
});

/**
 * DELETE /api/dossiers/:id
 * Soft delete a dossier
 */
router.delete('/:id', checkPermission('DOSSIERS', 'can_delete'), async (req, res) => {
    try {
        let query = `SELECT IDDossiers FROM dossiers WHERE IDDossiers = ?`;
        let params = [req.params.id];
        if (!req.user.is_provider) {
            query += ' AND structur_id = ?';
            params.push(req.structur_id);
        }

        const [exist] = await pool.query(query, params);
        if (exist.length === 0) {
            return res.status(404).json({ error: 'Dossier not found' });
        }

        await pool.query(
            `UPDATE dossiers SET Facturable = -1 WHERE IDDossiers = ?`,
            [req.params.id]
        );

        await auditService.log({
            agent_id: req.user.id,
            structur_id: req.user.structur_id,
            action: 'DELETE',
            resource_type: 'DOSSIER',
            resource_id: req.params.id,
            details: 'Soft delete applied',
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        res.json({ message: 'Dossier deleted (soft)' });
    } catch (err) {
        console.error('Delete dossier error:', err);
        res.status(500).json({ error: 'Failed to delete dossier' });
    }
});

module.exports = router;
