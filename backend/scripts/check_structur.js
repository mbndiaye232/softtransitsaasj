const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkStructurSchema() {
    console.log('Checking structur schema...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query('DESCRIBE structur');
        console.table(rows);
    } catch (error) {
        console.error('Schema check failed:', error.message);
    } finally {
        await pool.end();
    }
}

checkStructurSchema();
