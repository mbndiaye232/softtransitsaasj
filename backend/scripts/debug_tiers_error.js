require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:3001/api';
const JWT_SECRET = process.env.JWT_SECRET;

async function testGetTiers() {
    try {
        if (!JWT_SECRET) {
            console.error('JWT_SECRET missing');
            return;
        }

        const token = jwt.sign(
            { userId: 1, role: 'ADMIN', structur_id: 1, is_provider: 1 },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const headers = { Authorization: `Bearer ${token}` };

        console.log('GET /api/tiers...');
        try {
            const res = await axios.get(`${API_URL}/tiers`, { headers });
            console.log('✅ Success:', res.data.length, 'items');
        } catch (err) {
            console.log('❌ Failed:', err.response?.status);
            console.log('Data:', err.response?.data);
        }

    } catch (error) {
        console.error('Script error:', error);
    }
}

testGetTiers();
