// Test script to check backend logs
const axios = require('axios');

async function testCreateDossier() {
    try {
        // First, login to get token
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✓ Logged in successfully');
        console.log('Token:', token.substring(0, 20) + '...');

        // Create FormData-like object
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('label', 'Test Dossier');
        formData.append('nature', 'IMP');
        formData.append('mode', 'MA');
        formData.append('type', 'TC');
        formData.append('description', 'Test description');
        formData.append('clientId', '2');
        formData.append('quotationStep', 'false');

        console.log('\n=== Sending dossier creation request ===');
        console.log('clientId:', '2');

        const response = await axios.post('http://localhost:3001/api/dossiers', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('\n✓ Dossier created successfully!');
        console.log('Response:', response.data);

    } catch (error) {
        console.error('\n✗ Error creating dossier:');
        console.error('Status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Error message:', error.message);
    }
}

testCreateDossier();
