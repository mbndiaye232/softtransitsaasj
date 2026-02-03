const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkSchema() {
    console.log('Checking schema...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [clients] = await pool.query('DESCRIBE CLIENTS');
        console.log('--- CLIENTS ---');
        console.table(clients);

        const [accounts] = await pool.query('DESCRIBE ComptesClients');
        console.log('--- ComptesClients ---');
        console.table(accounts);

    } catch (error) {
        console.error('Schema check failed:', error.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
