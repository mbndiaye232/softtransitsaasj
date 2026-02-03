const pool = require('../config/database');

async function checkEtapes() {
    try {
        const [rows] = await pool.query("SELECT * FROM etapesdossiers");
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkEtapes();
