const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyImport() {
    console.log('Verifying country import...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM Pays');
        console.log(`Total countries in database: ${rows[0].count}`);

        const [sample] = await pool.query('SELECT * FROM Pays LIMIT 5');
        console.log('Sample data:');
        console.table(sample);

        if (rows[0].count > 0) {
            console.log('Verification SUCCESS: Data found in Pays table.');
        } else {
            console.error('Verification FAILED: Pays table is empty.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await pool.end();
    }
}

verifyImport();
