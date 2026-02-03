require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function importDevises() {
    const connection = await pool.getConnection();

    try {
        console.log('📖 Reading XML file...');
        const xmlPath = path.join(__dirname, '../../docs/Export devises.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');

        console.log('🔍 Parsing XML...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const records = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`✓ Found ${records.length} currency records`);

        await connection.beginTransaction();

        console.log('🗑️  Clearing existing currencies...');
        await connection.query('DELETE FROM devises');

        console.log('💾 Inserting currencies...');
        const query = `
            INSERT INTO devises (IDDevises, libelle, Symbole, TauxChangeDeviseCFA, IdAgent)
            VALUES (?, ?, ?, ?, ?)
        `;

        for (const record of records) {
            await connection.query(query, [
                record.IDDevises[0],
                record.libelle[0],
                record.Symbole[0],
                record.TauxChangeDeviseCFA[0],
                record.IdAgent[0]
            ]);
            console.log(`  ✓ ${record.libelle[0]} (${record.Symbole[0]}) - ${record.TauxChangeDeviseCFA[0]} FCFA`);
        }

        await connection.commit();
        console.log('\n✅ Currencies import completed successfully!');

    } catch (error) {
        await connection.rollback();
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

importDevises();
