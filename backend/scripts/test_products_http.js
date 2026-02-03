const axios = require('axios');

async function testProductsEndpoint() {
    try {
        console.log('Testing GET /api/produits endpoint...\n');

        const response = await axios.get('http://localhost:3001/api/produits', {
            params: {
                page: 1,
                limit: 10
            }
        });

        console.log('Status:', response.status);
        console.log('Data structure:', {
            hasProducts: !!response.data.products,
            productsCount: response.data.products?.length,
            total: response.data.total,
            page: response.data.page,
            limit: response.data.limit
        });

        if (response.data.products && response.data.products.length > 0) {
            console.log('\nFirst 3 products:');
            response.data.products.slice(0, 3).forEach((p, i) => {
                console.log(`${i + 1}. ${p.NTS} - ${p.Libelle}`);
            });
        }

        console.log('\n✓ Endpoint is working correctly!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testProductsEndpoint();
