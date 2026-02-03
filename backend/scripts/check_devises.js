require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkDevises() {
    const connection = await pool.getConnection();
    try {
        const [exists] = await connection.query("SHOW TABLES LIKE 'devises'");
        if (exists.length > 0) {
            console.log("✅ Table 'devises' exists.");
            const [schema] = await connection.query("DESCRIBE devises");
            console.table(schema);
        } else {
            console.log("❌ Table 'devises' does not exist.");
        }
    } catch (error) {
        console.error(error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

checkDevises();
