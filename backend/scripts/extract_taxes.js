require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function extractTaxes() {
    const connection = await pool.getConnection();

    try {
        console.log('📖 Reading XML file...');
        const xmlPath = path.join(__dirname, '../../docs/Export tarifs.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');

        console.log('🔍 Parsing XML to extract unique tax types...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const tarifRecords = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`✓ Found ${tarifRecords.length} tariff records`);

        // Extract unique tax types
        const taxesMap = new Map();
        tarifRecords.forEach(record => {
            const idTaxes = parseInt(record.IDTaxes[0]);
            const codeTaxe = record.CodeTaxe[0];
            const idAgent = parseInt(record.IdAgent[0]) || 0;

            if (!taxesMap.has(idTaxes)) {
                taxesMap.set(idTaxes, {
                    IDTaxes: idTaxes,
                    CodeTaxe: codeTaxe,
                    IdAgent: idAgent
                });
            }
        });

        const uniqueTaxes = Array.from(taxesMap.values());
        console.log(`✓ Found ${uniqueTaxes.length} unique tax types`);

        await connection.beginTransaction();

        // Clear existing data
        console.log('🗑️  Clearing existing tax types...');
        await connection.query('DELETE FROM taxes');

        // Insert unique tax types
        console.log('💾 Inserting tax types...');
        const values = uniqueTaxes.map(t => [
            t.IDTaxes,
            t.CodeTaxe,
            '', // LibelleTaxe - empty for now
            t.IdAgent
        ]);

        await connection.query(
            `INSERT INTO taxes (IDTaxes, CodeTaxe, LibelleTaxe, IdAgent) VALUES ?`,
            [values]
        );

        await connection.commit();
        console.log(`✓ Import completed! Inserted ${uniqueTaxes.length} tax types`);

        // Show sample data
        const [samples] = await connection.query(`
            SELECT IDTaxes, CodeTaxe, IdAgent 
            FROM taxes 
            ORDER BY IDTaxes 
            LIMIT 10
        `);
        console.log(`\n📋 Sample tax types:`);
        samples.forEach(s => {
            console.log(`   ${s.IDTaxes}: ${s.CodeTaxe} (Agent: ${s.IdAgent})`);
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

extractTaxes();
