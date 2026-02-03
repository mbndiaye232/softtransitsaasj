const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        const hashedPassword = await bcrypt.hash('test1234', 10);
        await pool.query(`
            INSERT INTO agents (NomAgent, Email, Login, password_hash, role, is_active, structur_id)
            VALUES ('Test User', 'test@test.com', 'testuser', ?, 'ADMIN', 1, 1)
        `, [hashedPassword]);
        console.log('Test user created');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('Test user already exists');
        } else {
            console.error(error);
        }
        process.exit(0);
    }
}

createTestUser();
