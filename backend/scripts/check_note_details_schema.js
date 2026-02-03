require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkNoteSchema() {
    const connection = await pool.getConnection();
    try {
        const [schema] = await connection.query(`DESCRIBE notesdedetails`);
        console.table(schema);
    } catch (error) {
        console.error(error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

checkNoteSchema();
