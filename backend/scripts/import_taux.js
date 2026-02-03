require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function importTaux() {
    const connection = await pool.getConnection();

    try {
        console.log('📖 Reading XML file...');
        const xmlPath = path.join(__dirname, '../../docs/Export taux.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');

        console.log('🔍 Parsing XML...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const tauxRecords = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`✓ Found ${tauxRecords.length} tax rates`);

        await connection.beginTransaction();

        // Clear existing data
        console.log('🗑️  Clearing existing tax rates...');
        await connection.query('DELETE FROM taux');

        // Prepare data for batch insert
        const values = tauxRecords.map(t => [
            parseInt(t.IDTaux[0]),
            t.CodeTaux[0],
            parseFloat(t.Taux[0]),
            parseInt(t.IdAgent[0]) || 0
        ]);

        // Insert all records
        console.log('💾 Inserting tax rates...');
        await connection.query(
            `INSERT INTO taux (IDTaux, CodeTaux, Taux, IdAgent) VALUES ?`,
            [values]
        );

        await connection.commit();
        console.log(`✓ Import completed successfully! Inserted ${values.length} tax rates`);

        // Show stats
        const [stats] = await connection.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT CodeTaux) as unique_codes,
                MIN(Taux) as min_rate,
                MAX(Taux) as max_rate
            FROM taux
        `);
        console.log(`\n📊 Statistics:`);
        console.log(`   Total tax rates: ${stats[0].total}`);
        console.log(`   Unique codes: ${stats[0].unique_codes}`);
        console.log(`   Min rate: ${stats[0].min_rate}`);
        console.log(`   Max rate: ${stats[0].max_rate}`);

        // Show sample data
        const [samples] = await connection.query(`
            SELECT CodeTaux, Taux, IdAgent 
            FROM taux 
            ORDER BY IDTaux 
            LIMIT 5
        `);
        console.log(`\n📋 Sample data:`);
        samples.forEach(s => {
            console.log(`   ${s.CodeTaux}: ${s.Taux} (Agent: ${s.IdAgent})`);
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

importTaux();
