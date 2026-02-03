const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, tenantMiddleware, checkPermission } = require('../middleware/auth');
const auditService = require('../services/auditService');

// Apply middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/transactions
 * List all transactions for the current company
 */
router.get('/', checkPermission('STRUCTURES', 'can_view'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM transactions WHERE structur_id = ? ORDER BY created_at DESC',
            [req.structur_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

/**
 * POST /api/transactions/purchase
 * Initiate a credit purchase
 */
router.post('/purchase', checkPermission('STRUCTURES', 'can_edit'), async (req, res) => {
    try {
        const { amount, credits, paymentMethod } = req.body;

        if (!amount || !credits) {
            return res.status(400).json({ error: 'Amount and credits are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO transactions (
                structur_id, amount, credits, type, status, payment_method, created_at
            ) VALUES (?, ?, ?, 'PURCHASE', 'PENDING', ?, NOW())`,
            [req.structur_id, amount, credits, paymentMethod || 'MOCK_CARD']
        );

        await auditService.log({
            agent_id: req.user.id,
            structur_id: req.user.structur_id,
            action: 'PURCHASE_INIT',
            resource_type: 'TRANSACTION',
            resource_id: result.insertId,
            details: { amount, credits },
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        res.status(201).json({
            id: result.insertId,
            message: 'Transaction initiated',
            status: 'PENDING'
        });

    } catch (error) {
        console.error('Purchase initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate purchase' });
    }
});

/**
 * POST /api/transactions/confirm
 * Confirm a purchase (Mock Payment)
 */
router.post('/confirm', checkPermission('STRUCTURES', 'can_edit'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({ error: 'Transaction ID is required' });
        }

        await connection.beginTransaction();

        const [transactions] = await connection.query(
            'SELECT * FROM transactions WHERE id = ? AND structur_id = ? FOR UPDATE',
            [transactionId, req.structur_id]
        );

        if (transactions.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const transaction = transactions[0];

        if (transaction.status === 'COMPLETED') {
            await connection.rollback();
            return res.status(400).json({ error: 'Transaction already completed' });
        }

        await connection.query(
            'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?',
            ['COMPLETED', transactionId]
        );

        await connection.query(
            'UPDATE structur SET credit_balance = credit_balance + ? WHERE IDSociete = ?',
            [transaction.credits, req.structur_id]
        );

        await auditService.log({
            agent_id: req.user.id,
            structur_id: req.user.structur_id,
            action: 'PURCHASE_CONFIRM',
            resource_type: 'TRANSACTION',
            resource_id: transactionId,
            details: { credits: transaction.credits },
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        await connection.commit();

        res.json({
            message: 'Purchase confirmed successfully',
            creditsAdded: transaction.credits,
            newStatus: 'COMPLETED'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Purchase confirmation error:', error);
        res.status(500).json({ error: 'Failed to confirm purchase' });
    } finally {
        connection.release();
    }
});

module.exports = router;
