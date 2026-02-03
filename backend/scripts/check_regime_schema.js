require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkRegimeSchema() {
    const connection = await pool.getConnection();
    try {
        const [schema] = await connection.query(`DESCRIBE regimedeclaration`);
        console.table(schema);
    } catch (error) {
        console.error(error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

checkRegimeSchema();
