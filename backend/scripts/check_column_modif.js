const pool = require('../config/database');

async function checkColumnModif() {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM dossiers LIKE 'IdAgModiff'");
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkColumnModif();
