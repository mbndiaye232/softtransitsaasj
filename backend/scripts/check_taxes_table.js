require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkTaxesTable() {
    try {
        const [structure] = await pool.query('DESCRIBE taxes');
        console.log('📋 Taxes table structure:');
        console.table(structure);

        const [count] = await pool.query('SELECT COUNT(*) as count FROM taxes');
        console.log(`\n📊 Current records: ${count[0].count}`);

        if (count[0].count > 0) {
            const [sample] = await pool.query('SELECT * FROM taxes LIMIT 3');
            console.log('\n📄 Sample data:');
            console.table(sample);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit(0);
    }
}

checkTaxesTable();
