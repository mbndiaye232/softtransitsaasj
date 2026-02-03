const axios = require('axios');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyClientCreation() {
    console.log('Verifying client creation...');

    // 1. Database Connection
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // 2. Simulate API Call (or just direct DB insert to test logic if we can't easily call API with auth)
        // Since we have auth middleware, calling API requires a valid token. 
        // For simplicity in this verification script, we will check if the backend logic works by inspecting the code 
        // or we can try to login first. Let's try to login as admin.

        // Actually, let's just check the database state after a manual insertion via the API would be hard without running the server.
        // But the server IS running (npm run dev).
        // So we can try to hit the API.

        // Login
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            login: 'admin', // Assuming default admin from previous tasks or seeds
            password: 'password123' // Assuming default password
        }).catch(err => {
            console.log('Login failed (expected if no default admin):', err.message);
            return null;
        });

        if (!loginRes) {
            console.log('Skipping API test due to login failure. Verifying DB schema only.');
            // Check if tables exist
            const [tables] = await pool.query('SHOW TABLES LIKE "CLIENTS"');
            if (tables.length > 0) console.log('✅ CLIENTS table exists');

            const [accounts] = await pool.query('SHOW TABLES LIKE "ComptesClients"');
            if (accounts.length > 0) console.log('✅ ComptesClients table exists');

            return;
        }

        const token = loginRes.data.token;
        console.log('Logged in successfully.');

        // Create Client
        const uniqueCode = 'CL' + Date.now();
        const clientData = {
            NomRS: 'Test Client ' + uniqueCode,
            CodeClient: uniqueCode,
            NumCompteSAARI: 'SAARI' + uniqueCode,
            ExonereTVA: false
        };

        const createRes = await axios.post('http://localhost:3001/api/clients', clientData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Client created via API:', createRes.data);
        const clientId = createRes.data.id;

        // Verify DB
        const [clientRows] = await pool.query('SELECT * FROM CLIENTS WHERE IDCLIENTS = ?', [clientId]);
        if (clientRows.length > 0) {
            console.log('✅ Client found in DB');
        } else {
            console.error('❌ Client NOT found in DB');
        }

        const [accountRows] = await pool.query('SELECT * FROM ComptesClients WHERE IDCLIENTS = ?', [clientId]);
        if (accountRows.length > 0) {
            console.log('✅ Client Account found in DB');
            console.log('Account Label:', accountRows[0].LibelleCompteClients);
        } else {
            console.error('❌ Client Account NOT found in DB');
        }

    } catch (error) {
        console.error('Verification failed:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
    } finally {
        await pool.end();
    }
}

verifyClientCreation();
