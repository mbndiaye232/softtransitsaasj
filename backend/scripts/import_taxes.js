require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function importTaxes() {
    const connection = await pool.getConnection();

    try {
        console.log('📖 Reading XML file...');
        const xmlPath = path.join(__dirname, '../../docs/Export taxes.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');

        console.log('🔍 Parsing XML...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const taxes = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`✓ Found ${taxes.length} taxes`);

        await connection.beginTransaction();

        // Clear existing data
        console.log('🗑️  Clearing existing taxes...');
        await connection.query('DELETE FROM taxes');

        // Reset auto-increment
        await connection.query('ALTER TABLE taxes AUTO_INCREMENT = 1');

        // Insert taxes
        let inserted = 0;
        for (const tax of taxes) {
            await connection.query(
                `INSERT INTO taxes (IDTaxes, LibelleTaxe, CodeTaxe, LibelleTaxeComplet, IdAgent, Niveau, Base) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    parseInt(tax.IDTaxes[0]),
                    tax.LibelleTaxe[0],
                    tax.CodeTaxe[0],
                    tax.LibelleTaxeComplet[0],
                    parseInt(tax.IdAgent[0]) || 0,
                    parseInt(tax.Niveau[0]) || 0,
                    tax.Base && tax.Base[0] ? tax.Base[0] : null
                ]
            );
            inserted++;
            process.stdout.write(`\r💰 Importing taxes: ${inserted}/${taxes.length}`);
        }

        await connection.commit();
        console.log('\n✓ Import completed successfully!');

        // Show stats
        const [stats] = await connection.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT CodeTaxe) as unique_codes,
                COUNT(DISTINCT Niveau) as unique_levels
            FROM taxes
        `);
        console.log(`\n📊 Statistics:`);
        console.log(`   Total taxes: ${stats[0].total}`);
        console.log(`   Unique codes: ${stats[0].unique_codes}`);
        console.log(`   Tax levels: ${stats[0].unique_levels}`);

        // Show sample
        const [sample] = await connection.query('SELECT * FROM taxes LIMIT 5');
        console.log('\n📄 Sample taxes:');
        console.table(sample);

    } catch (error) {
        await connection.rollback();
        console.error('\n❌ Import error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

importTaxes();
