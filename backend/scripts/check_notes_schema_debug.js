require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkSchema() {
    try {
        console.log('Checking schema for notesdedetails...');
        const [rows] = await pool.query('DESCRIBE notesdedetails');
        console.table(rows);
    } catch (error) {
        console.error('Error checking schema:', error.message);
    } finally {
        process.exit(0);
    }
}

checkSchema();
