require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function verifyTables() {
    try {
        console.log('Verifying notesdedetails table...');
        await pool.query('SELECT 1 FROM notesdedetails LIMIT 1');
        console.log('✓ notesdedetails table exists and is accessible');

        console.log('Verifying articles table...');
        await pool.query('SELECT 1 FROM articles LIMIT 1');
        console.log('✓ articles table exists and is accessible');

        console.log('\nVerification successful: Tables are ready.');
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verifyTables();
