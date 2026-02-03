async function testGetDossiers() {
    try {
        console.log('Authenticating...');
        // Login
        const loginResponse = await fetch('http://127.0.0.1:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: 'test@test.com',
                password: 'test1234'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed with status ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✓ Authenticated');

        // Get Dossiers
        console.log('Fetching dossiers...');
        const response = await fetch('http://127.0.0.1:3001/api/dossiers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✓ Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
                console.log('✓ First dossier keys:', Object.keys(data[0]));
                console.log('✓ Cloture value:', data[0].Cloture);
            } else {
                console.log('⚠ No dossiers found to check keys');
            }
        } else {
            console.error('✗ Failed to fetch dossiers:', response.statusText);
            const errText = await response.text();
            console.error('Error body:', errText);
        }
    } catch (error) {
        console.error('✗ Error:', error.message);
    }
}

testGetDossiers();
