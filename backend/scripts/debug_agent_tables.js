const pool = require('../config/database');

async function checkTables() {
    try {
        console.log('\nChecking structur table...');
        const [structur] = await pool.query('DESCRIBE structur');
        console.log(structur);

        process.exit(0);
    } catch (error) {
        console.error('Error checking tables:', error);
        process.exit(1);
    }
}

checkTables();
