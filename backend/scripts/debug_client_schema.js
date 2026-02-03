require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function debugClient() {
    try {
        const [clients] = await pool.query('SELECT * FROM CLIENTS LIMIT 1');
        if (clients.length > 0) {
            console.log('Client keys:', Object.keys(clients[0]));
            console.log('Client sample:', clients[0]);
        } else {
            console.log('No clients found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

debugClient();
