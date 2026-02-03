const axios = require('axios');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyCreditPurchase() {
    console.log('Verifying Credit Purchase...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Login
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            login: 'admin',
            password: 'password123'
        }).catch(err => {
            console.log('Login failed:', err.message);
            return null;
        });

        if (!loginRes) {
            console.log('Skipping API test due to login failure.');
            return;
        }

        const token = loginRes.data.token;
        const structurId = loginRes.data.user.structur_id;
        console.log('Logged in successfully. Structur ID:', structurId);

        // Get initial balance
        const [initialRows] = await pool.query('SELECT credit_balance FROM structur WHERE IDSociete = ?', [structurId]);
        const initialBalance = parseFloat(initialRows[0].credit_balance);
        console.log('Initial Balance:', initialBalance);

        // 1. Initiate Purchase
        const purchaseRes = await axios.post('http://localhost:3001/api/transactions/purchase', {
            amount: 10000,
            credits: 100,
            paymentMethod: 'TEST_SCRIPT'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Purchase initiated:', purchaseRes.data);
        const transactionId = purchaseRes.data.id;

        // 2. Confirm Purchase
        const confirmRes = await axios.post('http://localhost:3001/api/transactions/confirm', {
            transactionId: transactionId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Purchase confirmed:', confirmRes.data);

        // 3. Verify Balance
        const [finalRows] = await pool.query('SELECT credit_balance FROM structur WHERE IDSociete = ?', [structurId]);
        const finalBalance = parseFloat(finalRows[0].credit_balance);
        console.log('Final Balance:', finalBalance);

        if (finalBalance === initialBalance + 100) {
            console.log('✅ Credit Purchase Verified Successfully');
        } else {
            console.error('❌ Credit Balance Mismatch');
        }

    } catch (error) {
        console.error('Verification failed:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
    } finally {
        await pool.end();
    }
}

verifyCreditPurchase();
