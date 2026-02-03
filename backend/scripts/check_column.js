const pool = require('../config/database');

async function checkColumns() {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM dossiers LIKE 'IdAgentSaisi'");
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkColumns();
