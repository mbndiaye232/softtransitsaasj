const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verify() {
    console.log('Verifying activities and tier associations...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [activites] = await pool.query('SELECT * FROM activites');
        console.log('--- NOTABLE ACTIVITIES ---');
        console.table(activites);

        const [tiers] = await pool.query(`
            SELECT t.IDTiers, t.libtier, acts.activity_labels
            FROM tiers t
            LEFT JOIN (
                SELECT ta.id_tier, GROUP_CONCAT(a.libelle) as activity_labels
                FROM tier_activites ta
                JOIN activites a ON ta.id_activite = a.id_activite
                GROUP BY ta.id_tier
            ) acts ON t.IDTiers = acts.id_tier
            LIMIT 5
        `);
        console.log('--- TIERS WITH ACTIVITIES ---');
        console.table(tiers);

    } catch (error) {
        console.error('Verification failed:', error.message);
    } finally {
        await pool.end();
    }
}

verify();
