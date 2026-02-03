require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function importProducts() {
    const connection = await pool.getConnection();

    try {
        console.log('📖 Reading XML file...');
        const xmlPath = path.join(__dirname, '../../docs/Export produts.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');

        console.log('🔍 Parsing XML...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const products = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`✓ Found ${products.length} products`);

        await connection.beginTransaction();

        // Clear existing data
        console.log('🗑️  Clearing existing products...');
        await connection.query('DELETE FROM produits');

        // Batch insert for better performance
        const batchSize = 1000;
        let inserted = 0;

        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            const values = batch.map(p => [
                parseInt(p.IDProduits[0]),
                p.Libelle[0],
                p.NTS[0],
                parseInt(p.IDAgents[0]) || 0
            ]);

            await connection.query(
                `INSERT INTO produits (IDProduits, Libelle, NTS, IDAgents) VALUES ?`,
                [values]
            );

            inserted += batch.length;
            process.stdout.write(`\r📦 Importing products: ${inserted}/${products.length}`);
        }

        await connection.commit();
        console.log('\n✓ Import completed successfully!');

        // Show stats
        const [stats] = await connection.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT NTS) as unique_codes
            FROM produits
        `);
        console.log(`\n📊 Statistics:`);
        console.log(`   Total products: ${stats[0].total}`);
        console.log(`   Unique HS codes: ${stats[0].unique_codes}`);

    } catch (error) {
        await connection.rollback();
        console.error('\n❌ Import error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

importProducts();
