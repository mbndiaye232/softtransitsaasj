// Test script to simulate the exact API call the frontend makes
const axios = require('axios');

async function testClientAPI() {
    try {
        console.log('Step 1: Login to get token...');

        // First, login to get a token
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@example.com',  // You may need to adjust these credentials
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✓ Login successful, token received');

        console.log('\nStep 2: Fetch clients with token...');

        // Now fetch clients with the token
        const clientsResponse = await axios.get('http://localhost:3001/api/clients', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('\n✓ Clients API Response:');
        console.log('Total clients:', clientsResponse.data.length);

        if (clientsResponse.data.length > 0) {
            console.log('\nFirst client data:');
            const firstClient = clientsResponse.data[0];
            console.log('- IDClients:', firstClient.IDClients);
            console.log('- NomClient:', firstClient.NomClient);
            console.log('- Adresse:', firstClient.Adresse);
            console.log('- Tel1:', firstClient.Tel1);
            console.log('- Tel2:', firstClient.Tel2);
            console.log('- Email:', firstClient.Email);

            console.log('\n✅ API is working correctly!');
            console.log('The frontend should receive this data.');
        } else {
            console.log('\n⚠️ No clients found for this user');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('\n💡 Try updating the login credentials in this script');
        }
    }
}

testClientAPI();
