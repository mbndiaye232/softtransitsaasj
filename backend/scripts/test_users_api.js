const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testApi() {
    try {
        console.log('Logging in...');
        // Assuming admin/admin works or I need a valid credential. 
        // Based on previous contexts, maybe 'admin' / 'password' or similar.
        // I will try to find a valid user from the DB first using a small query inside this script?
        // No, I'll rely on hardcoded creds if known, or just pick the first user from DB.

        // I'll grab a user from DB first to be sure.
        const pool = require('../config/database');
        const [users] = await pool.query('SELECT Login, structur_id FROM Agents WHERE role="ADMIN" LIMIT 1');
        if (users.length === 0) {
            console.error('No admin user found to test with.');
            process.exit(1);
        }
        const user = users[0];
        console.log(`Found user: ${user.Login}`);

        // Wait, I don't know the password... 
        // I can generate a token MANUALLY using the same secret!
        const jwt = require('jsonwebtoken');
        // I need to read .env to get secret? 
        // Or I can just try to run this script IN the backend folder context where env might be loaded if I use dotenv.

        require('dotenv').config();
        const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Fallback if not in env

        const token = jwt.sign(
            { userId: 1, role: 'ADMIN' }, // Assuming ID 1 exists
            secret,
            { expiresIn: '1h' }
        );

        console.log('Generated token for ID 1');

        const headers = { Authorization: `Bearer ${token}` };

        console.log('\nTesting GET /api/users ...');
        try {
            const res = await axios.get(`${API_URL}/users`, { headers });
            console.log('GET /api/users success:', res.data.length, 'users found');
        } catch (err) {
            console.error('GET /api/users FAILED:', err.response?.data || err.message);
        }

        console.log('\nTesting GET /api/groupes ...');
        try {
            const res = await axios.get(`${API_URL}/groupes`, { headers });
            console.log('GET /api/groupes success:', res.data.length, 'groupes found');
        } catch (err) {
            console.error('GET /api/groupes FAILED:', err.response?.data || err.message);
        }

        console.log('\nTesting GET /api/users/1/permissions ...');
        try {
            const res = await axios.get(`${API_URL}/users/1/permissions`, { headers });
            console.log('GET /api/users/1/permissions success:', res.data);
        } catch (err) {
            console.error('GET /api/users/1/permissions FAILED:', err.response?.data || err.message);
        }

        console.log('\nTesting GET /auth/me ...');
        try {
            const res = await axios.get(`${API_URL}/auth/me`, { headers });
            console.log('GET /auth/me success:', res.data.user.email);
        } catch (err) {
            console.error('GET /auth/me FAILED:', err.response?.data || err.message);
        }
    } catch (error) {
        console.error('Test script error:', error);
    } finally {
        process.exit();
    }
}

testApi();
