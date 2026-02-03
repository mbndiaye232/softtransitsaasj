require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function testProductsAPI() {
    try {
        console.log('Testing products API...\n');

        // Check if products table exists and has data
        console.log('1. Checking products table...');
        const [count] = await pool.query('SELECT COUNT(*) as total FROM produits');
        console.log(`   Total products in database: ${count[0].total}`);

        if (count[0].total === 0) {
            console.log('   ⚠️  No products found in database!');
            process.exit(0);
        }

        // Test the query that the API uses
        console.log('\n2. Testing API query (first 10 products)...');
        const [products] = await pool.query(
            'SELECT IDProduits, NTS, Libelle FROM produits ORDER BY NTS LIMIT 10'
        );

        console.log(`   Found ${products.length} products:`);
        products.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.NTS} - ${p.Libelle}`);
        });

        // Test search functionality
        console.log('\n3. Testing search functionality...');
        const searchTerm = '%test%';
        const [searchResults] = await pool.query(
            'SELECT IDProduits, NTS, Libelle FROM produits WHERE NTS LIKE ? OR Libelle LIKE ? LIMIT 5',
            [searchTerm, searchTerm]
        );
        console.log(`   Search results for "${searchTerm}": ${searchResults.length} found`);

        console.log('\n✓ Products API test completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

testProductsAPI();
