const axios = require('axios');

async function verifyOTUpdate() {
    try {
        // Login to get token
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            login: 'admin@example.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✓ Logged in successfully');

        // 1. Get all transit orders to find one to update
        const otRes = await axios.get('http://localhost:3001/api/ordres-transit', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (otRes.data.length === 0) {
            console.log('! No transit orders found, cannot verify update.');
            return;
        }

        const ot = otRes.data[0];
        const otId = ot.IDOrdresTransit;
        console.log(`✓ Found OT ID: ${otId}`);

        // 2. Test the new PUT route
        console.log(`\nTesting: PUT /api/ordres-transit/${otId}`);
        const updateRes = await axios.put(`http://localhost:3001/api/ordres-transit/${otId}`, {
            ...ot,
            Observations: 'Updated by verification script ' + new Date().toISOString()
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (updateRes.status === 200) {
            console.log('✓ Update route functional!');
            console.log('Response:', updateRes.data.message);
        } else {
            console.log(`✗ Update failed with status: ${updateRes.status}`);
        }

    } catch (error) {
        console.error('\n✗ Verification error:');
        console.error('Error:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

verifyOTUpdate();
