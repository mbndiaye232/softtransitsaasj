const axios = require('axios');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyStatusAndClient() {
    console.log('Verifying Status and Client creation...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Login
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            login: 'admin',
            password: 'password123'
        }).catch(err => {
            console.log('Login failed:', err.message);
            return null;
        });

        if (!loginRes) {
            console.log('Skipping API test due to login failure.');
            return;
        }

        const token = loginRes.data.token;
        console.log('Logged in successfully.');

        // 1. Create Status
        const statusRes = await axios.post('http://localhost:3001/api/statuts', {
            libelle: 'Actif Test'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Status created:', statusRes.data);
        const statusId = statusRes.data.id;

        // 2. Create Client with Status
        const uniqueCode = 'CL-S-' + Date.now();
        const clientData = {
            NomRS: 'Client With Status ' + uniqueCode,
            CodeClient: uniqueCode,
            NumCompteSAARI: 'SAARI-' + uniqueCode,
            ExonereTVA: false,
            IDStatuts: statusId
        };

        const clientRes = await axios.post('http://localhost:3001/api/clients', clientData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Client created:', clientRes.data);

        // Verify in DB
        const [rows] = await pool.query('SELECT * FROM CLIENTS WHERE IDCLIENTS = ?', [clientRes.data.id]);
        if (rows.length > 0 && rows[0].IDStatuts === statusId) {
            console.log('✅ Client created with correct Status ID');
        } else {
            console.error('❌ Client verification failed');
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

verifyStatusAndClient();
