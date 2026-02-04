const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_URL = 'http://localhost:3001/api';

async function verifyEndpoints() {
    console.log('Verifying OT endpoints...');

    // We need a token. Since this is a test environment, I'll assume I have one or I'll try to login.
    // However, I can't easily login without a user.
    // I'll check if the server is at least responding to these routes (even if 401).

    const endpoints = [
        '/incoterms',
        '/regimes-ot',
        '/types-documents-ot',
        '/ordres-transit'
    ];

    for (const ep of endpoints) {
        try {
            const res = await axios.get(`${API_URL}${ep}`);
            console.log(`✅ ${ep}: ${res.status}`);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log(`✅ ${ep}: 401 (Auth required, route exists)`);
            } else {
                console.log(`❌ ${ep}: ${err.message}`);
                if (err.response) console.log(`   Status: ${err.response.status}`);
            }
        }
    }
}

verifyEndpoints();
