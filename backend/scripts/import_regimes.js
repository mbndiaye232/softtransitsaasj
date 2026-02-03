require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function importRegimes() {
    const connection = await pool.getConnection();

    try {
        console.log('📖 Reading XML file...');
        const xmlPath = path.join(__dirname, '../../docs/Export régimes déclaration.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');

        console.log('🔍 Parsing XML...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const records = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`✓ Found ${records.length} regime records`);

        await connection.beginTransaction();

        console.log('🗑️  Clearing existing regimes...');
        await connection.query('DELETE FROM regimedeclaration');

        console.log('💾 Inserting regimes...');
        const query = `
            INSERT INTO regimedeclaration (IDRegimeDeclaration, LibelleRegimeDeclaration, CodeRegimeDeclaration, Observations)
            VALUES ?
        `;

        const values = records.map(r => [
            r.IDRegimeDeclaration[0],
            r.LibelleRegimeDeclaration[0],
            r.CodeRegimeDeclaration[0],
            r.Observations ? r.Observations[0] : ''
        ]);

        // Batch insert
        const batchSize = 1000;
        for (let i = 0; i < values.length; i += batchSize) {
            const batch = values.slice(i, i + batchSize);
            await connection.query(query, [batch]);
            process.stdout.write(`\r📦 Inserted ${Math.min(i + batchSize, values.length)}/${values.length}`);
        }

        await connection.commit();
        console.log('\n\n✅ Regimes import completed successfully!');

    } catch (error) {
        await connection.rollback();
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

importRegimes();
