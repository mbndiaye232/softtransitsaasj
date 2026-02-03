const pool = require('../config/database');

async function addMissingPermissions() {
    try {
        console.log('Adding missing permissions...');
        const missing = [
            { code: 'PRODUITS', name: 'Référentiel Produits' },
            { code: 'REGIMES', name: 'Référentiel Régimes' },
            { code: 'STATUTS', name: 'Référentiel Statuts' },
            { code: 'GROUPES', name: 'Gestion des Groupes' },
            { code: 'TIERS', name: 'Gestion des Tiers' }
        ];

        for (const p of missing) {
            await pool.query(
                'INSERT IGNORE INTO permissions (code, name) VALUES (?, ?)',
                [p.code, p.name]
            );
        }

        console.log('Permissions added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error adding permissions:', error);
        process.exit(1);
    }
}

addMissingPermissions();
