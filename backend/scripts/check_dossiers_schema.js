require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkSchema() {
    try {
        console.log('Checking schema for dossiers...');
        const [rows] = await pool.query('DESCRIBE dossiers');
        console.table(rows);

        console.log('\nChecking foreign key constraints on notesdedetails...');
        const [fks] = await pool.query(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'notesdedetails'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        console.table(fks);
    } catch (error) {
        console.error('Error checking schema:', error.message);
    } finally {
        process.exit(0);
    }
}

checkSchema();
