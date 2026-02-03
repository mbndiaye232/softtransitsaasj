async function debugMe() {
    console.log('Debugging /api/auth/me...');

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: 'mbndiaye',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token:', token.substring(0, 20) + '...');

        // 2. Call /me
        console.log('Calling /api/auth/me...');
        const meRes = await fetch('http://localhost:3001/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!meRes.ok) {
            console.error('Error occurred:');
            console.error('Status:', meRes.status);
            const text = await meRes.text();
            try {
                const json = JSON.parse(text);
                console.error('Data:', JSON.stringify(json, null, 2));
            } catch (e) {
                console.error('Data:', text);
            }
        } else {
            const meData = await meRes.json();
            console.log('Success:', meData);
        }

    } catch (error) {
        console.error('Script error:', error.message);
    }
}

debugMe();
