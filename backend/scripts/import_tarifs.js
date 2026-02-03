require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function importTarifs() {
    const connection = await pool.getConnection();

    try {
        console.log('📖 Reading XML file...');
        const xmlPath = path.join(__dirname, '../../docs/Export tarifs.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');

        console.log('🔍 Parsing XML...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const tarifRecords = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`✓ Found ${tarifRecords.length} tariff records`);

        await connection.beginTransaction();

        // Disable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Clear existing data
        console.log('🗑️  Clearing existing tariffs...');
        await connection.query('DELETE FROM tarifs');

        // Batch insert for better performance
        const batchSize = 2000;
        let inserted = 0;
        let errors = 0;

        console.log('💾 Importing tariffs...');
        for (let i = 0; i < tarifRecords.length; i += batchSize) {
            const batch = tarifRecords.slice(i, i + batchSize);
            const values = [];

            for (const record of batch) {
                try {
                    values.push([
                        parseInt(record.IDTarifs[0]),
                        record.NTS[0],
                        record.CodeTaux[0],
                        record.CodeTaxe[0],
                        parseInt(record.IDTaux[0]),
                        parseInt(record.IDTaxes[0]),
                        parseInt(record.IDProduits[0]),
                        parseInt(record.IdAgent[0]) || 0
                    ]);
                } catch (err) {
                    errors++;
                    console.error(`⚠️  Error parsing record ${i}: ${err.message}`);
                }
            }

            if (values.length > 0) {
                await connection.query(
                    `INSERT INTO tarifs (IDTarifs, NTS, CodeTaux, CodeTaxe, IDTaux, IDTaxes, IDProduits, IdAgent) VALUES ?`,
                    [values]
                );

                inserted += values.length;
                const progress = ((inserted / tarifRecords.length) * 100).toFixed(1);
                process.stdout.write(`\r📦 Progress: ${inserted}/${tarifRecords.length} (${progress}%)`);
            }
        }

        // Clean up orphan records
        console.log('🧹 Cleaning up orphan records...');
        const [orphanResult] = await connection.query(`
            DELETE t FROM tarifs t
            LEFT JOIN produits p ON t.IDProduits = p.IDProduits
            WHERE p.IDProduits IS NULL
        `);
        console.log(`   Removed ${orphanResult.affectedRows} orphan records (missing products)`);

        // Re-enable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        await connection.commit();
        console.log(`\n✓ Import completed successfully!`);
        console.log(`   Inserted: ${inserted} records`);
        if (errors > 0) {
            console.log(`   Errors: ${errors} records`);
        }

        // Show stats
        const [stats] = await connection.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT NTS) as unique_products,
                COUNT(DISTINCT CodeTaux) as unique_rates,
                COUNT(DISTINCT CodeTaxe) as unique_taxes
            FROM tarifs
        `);
        console.log(`\n📊 Statistics:`);
        console.log(`   Total tariffs: ${stats[0].total}`);
        console.log(`   Unique products (NTS): ${stats[0].unique_products}`);
        console.log(`   Unique tax rates: ${stats[0].unique_rates}`);
        console.log(`   Unique tax types: ${stats[0].unique_taxes}`);

        // Show sample data
        const [samples] = await connection.query(`
            SELECT t.IDTarifs, t.NTS, t.CodeTaux, t.CodeTaxe, p.Libelle
            FROM tarifs t
            LEFT JOIN produits p ON t.IDProduits = p.IDProduits
            ORDER BY t.IDTarifs 
            LIMIT 5
        `);
        console.log(`\n📋 Sample tariffs:`);
        samples.forEach(s => {
            console.log(`   ${s.NTS} (${s.Libelle || 'N/A'}): ${s.CodeTaux} + ${s.CodeTaxe}`);
        });

    } catch (error) {
        await connection.rollback();
        console.error('\n❌ Import error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

importTarifs();
