const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function resetPassword() {
    console.log('Resetting password for mbndiaye...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const hash = await bcrypt.hash('SesameOubi+1959', 10);
        await pool.query('UPDATE Agents SET password_hash = ? WHERE Login = ?', [hash, 'mbndiaye']);
        console.log('Password reset successfully.');
    } catch (error) {
        console.error('Reset failed:', error.message);
    } finally {
        await pool.end();
    }
}

resetPassword();
