const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkOTTables() {
    console.log('Checking OT related tables...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const tables = [
        'OrdresTransit',
        'RegimeOT',
        'LiaisonRegimeOT',
        'TypesDocumentsOT',
        'LiaisonOTDocumentsARemettre',
        'Incoterm'
    ];

    try {
        for (const table of tables) {
            try {
                const [rows] = await pool.query(`DESCRIBE ${table}`);
                console.log(`✅ Table ${table} exists.`);
            } catch (err) {
                console.log(`❌ Table ${table} does NOT exist.`);
            }
        }
    } catch (error) {
        console.error('Check failed:', error.message);
    } finally {
        await pool.end();
    }
}

checkOTTables();
