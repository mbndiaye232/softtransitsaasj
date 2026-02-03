require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:3001/api';
const JWT_SECRET = process.env.JWT_SECRET;

async function testUserCreate() {
    if (!JWT_SECRET) {
        console.error('ERROR: JWT_SECRET is missing from .env');
        process.exit(1);
    }

    try {
        // 1. Generate a token for an admin user (ID 1)
        console.log('Generating token with secret:', JWT_SECRET.substring(0, 3) + '...');
        const token = jwt.sign(
            { userId: 1, role: 'ADMIN', structurId: 1 },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const headers = { Authorization: `Bearer ${token}` };

        const uniqueSuffix = Date.now().toString().slice(-4);

        // 2. Try with WEAK password
        console.log('Testing WEAK password...');
        const weakUser = {
            NomAgent: 'Test Weak',
            Email: `weak${uniqueSuffix}@test.com`,
            Login: `weak${uniqueSuffix}`,
            password: 'password', // Weak
            role: 'USER',
            IDGroupes: ''
        };

        try {
            await axios.post(`${API_URL}/users`, weakUser, { headers });
            console.log('❌ Weak password succeded (UNEXPECTED)');
        } catch (err) {
            console.log('✅ Weak password failed check:', err.response?.status, err.response?.data);
        }

        // 3. Try with STRONG password
        console.log('\nTesting STRONG password...');
        const strongUser = {
            NomAgent: 'Test Strong',
            Email: `strong${uniqueSuffix}@test.com`,
            Login: `strong${uniqueSuffix}`,
            password: 'Password123!', // Strong
            role: 'USER',
            IDGroupes: ''
        };

        try {
            const res = await axios.post(`${API_URL}/users`, strongUser, { headers });
            console.log('✅ Strong password succeeded:', res.data);
        } catch (err) {
            console.log('❌ Strong password failed:', err.response?.status, err.response?.data);
        }

    } catch (error) {
        console.error('Test script error:', error);
    }
}

testUserCreate();
