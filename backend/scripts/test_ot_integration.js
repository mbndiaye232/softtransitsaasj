const axios = require('axios');

async function verifyOTIntegration() {
    try {
        // Login to get token
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            login: 'admin@example.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✓ Logged in successfully');

        // 1. Get all dossiers to find an ID
        const dossiersRes = await axios.get('http://localhost:3001/api/dossiers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (dossiersRes.data.length === 0) {
            console.log('! No dossiers found, cannot proceed with full verification.');
            return;
        }

        const dossierId = dossiersRes.data[0].id;
        console.log(`✓ Found dossier ID: ${dossierId}`);

        // 2. Test the new route: GET /api/ordres-transit/dossier/:id
        console.log(`\nTesting: GET /api/ordres-transit/dossier/${dossierId}`);
        const otRes = await axios.get(`http://localhost:3001/api/ordres-transit/dossier/${dossierId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (otRes.status === 200) {
            if (otRes.data === null) {
                console.log('✓ Route functional (returned null as expected if no OT exists)');
            } else {
                console.log('✓ Route functional (returned existing OT data)');
            }
        } else {
            console.log(`✗ Route failed with status: ${otRes.status}`);
        }

        // 3. Verify reference data routes
        const refRoutes = [
            '/incoterms',
            '/regimes-ot',
            '/types-documents-ot'
        ];

        console.log('\nVerifying reference data routes:');
        for (const route of refRoutes) {
            try {
                const res = await axios.get(`http://localhost:3001/api${route}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(`  ✓ ${route}: ${res.data.length || 0} items found`);
            } catch (err) {
                console.log(`  ✗ ${route}: Failed (${err.message})`);
            }
        }

        console.log('\nVerification completed!');

    } catch (error) {
        console.error('\n✗ Verification error:');
        console.error('Error:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

verifyOTIntegration();
