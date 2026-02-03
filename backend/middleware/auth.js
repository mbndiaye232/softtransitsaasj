const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * Middleware to verify JWT token and attach user info to request
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database with structur info
        const [users] = await pool.query(
            `SELECT 
        a.IDAgents as id,
        a.structur_id,
        a.NomAgent as name,
        a.Email as email,
        a.Login as login,
        a.role,
        a.is_active,
        s.is_provider
      FROM Agents a
      JOIN structur s ON a.structur_id = s.IDSociete
      WHERE a.IDAgents = ? AND a.is_active = 1`,
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found or inactive' });
        }

        // Attach user to request
        req.user = users[0];
        console.log('AuthMiddleware: User found:', req.user.id, 'Role:', req.user.role, 'IsProvider:', req.user.is_provider);
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

/**
 * Middleware to check functional permissions
 * @param {string} resourceCode - Code of the resource (e.g., 'DOSSIERS')
 * @param {string} accessLevel - can_view, can_create, can_edit, can_delete
 */
const checkPermission = (resourceCode, accessLevel) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Admins of the provider company have all permissions
        if (req.user.role === 'ADMIN' && req.user.is_provider) {
            return next();
        }

        try {
            const [permissions] = await pool.query(
                `SELECT ap.* 
                 FROM agent_permissions ap
                 JOIN permissions p ON ap.permission_id = p.id
                 WHERE ap.agent_id = ? AND p.code = ?`,
                [req.user.id, resourceCode]
            );

            if (permissions.length === 0) {
                // If it's an ADMIN of a regular company, they might have full access to their company
                // But the user requested "associé aux fonctionnalités avec des privilèges déterminés"
                // So even ADMINs should have permissions assigned? 
                // Usually, the company creator (ADMIN) should have all permissions by default.
                if (req.user.role === 'ADMIN') {
                    return next();
                }
                return res.status(403).json({ error: `No permission assigned for ${resourceCode}` });
            }

            const perm = permissions[0];
            if (perm[accessLevel] === 1) {
                return next();
            }

            res.status(403).json({ error: `Insufficient privilege: ${accessLevel} on ${resourceCode}` });
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Internal server error during permission check' });
        }
    };
};

/**
 * Middleware to ensure user can only access their own company's data
 * Provider agents can access all data if they don't provide a specific structur_id
 */
const tenantMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Default to the user's company
    req.structur_id = req.user.structur_id;

    // If provider agent, they can specify a different structur_id in query or body
    if (req.user.is_provider) {
        const target_structur_id = req.query.structur_id || req.body.structur_id;
        if (target_structur_id) {
            req.structur_id = target_structur_id;
            req.is_viewing_all = false;
        } else if (req.method === 'GET') {
            // Special flag to indicate they want to see "everything" across all tenants
            // if no specific company is requested
            req.is_viewing_all = true;
        }
    }

    next();
};

module.exports = {
    authMiddleware,
    requireRole,
    checkPermission,
    tenantMiddleware
};
