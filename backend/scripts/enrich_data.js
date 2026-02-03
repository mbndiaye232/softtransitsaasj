require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function enrichData() {
    const connection = await pool.getConnection();

    try {
        console.log('📖 Reading XML file...');
        const xmlPath = path.join(__dirname, '../../docs/Export tectaxestaux.xml');
        const xmlData = fs.readFileSync(xmlPath, 'utf8');

        console.log('🔍 Parsing XML...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const records = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`✓ Found ${records.length} records`);

        // 1. Extract unique Tax Labels
        const taxMap = new Map();
        // 2. Extract unique Product Labels
        const productMap = new Map();

        records.forEach(r => {
            // Taxes
            const codeTaxe = r.CodeTaxe[0];
            if (codeTaxe && !taxMap.has(codeTaxe)) {
                taxMap.set(codeTaxe, {
                    libelle: r.LibelleTaxe[0],
                    libelleComplet: r.LibelleTaxeComplet[0]
                });
            }

            // Products
            const nts = r.NTS[0];
            const libelleProduit = r.LibelleProduit[0];
            if (nts && libelleProduit && !productMap.has(nts)) {
                productMap.set(nts, libelleProduit);
            }
        });

        console.log(`✓ Found ${taxMap.size} unique tax types`);
        console.log(`✓ Found ${productMap.size} unique products with labels`);

        await connection.beginTransaction();

        // Update Taxes
        console.log('\n💾 Updating taxes...');
        for (const [code, data] of taxMap) {
            await connection.query(`
                UPDATE taxes 
                SET LibelleTaxe = ?, LibelleTaxeComplet = ?
                WHERE CodeTaxe = ?
            `, [data.libelle, data.libelleComplet, code]);
        }
        console.log('✓ Taxes updated');

        // Update Products (Batch update for performance)
        console.log('\n💾 Updating products...');
        let updatedProducts = 0;
        const batchSize = 1000;
        const productEntries = Array.from(productMap.entries());

        for (let i = 0; i < productEntries.length; i += batchSize) {
            const batch = productEntries.slice(i, i + batchSize);

            // We have to do individual updates because MySQL doesn't support bulk update easily without a complex CASE statement
            // But we can use Promise.all to parallelize within the batch
            const promises = batch.map(([nts, libelle]) => {
                return connection.query(`
                    UPDATE produits 
                    SET Libelle = ?
                    WHERE NTS = ? AND (Libelle IS NULL OR Libelle = '' OR Libelle != ?)
                `, [libelle, nts, libelle]);
            });

            await Promise.all(promises);
            updatedProducts += batch.length;
            process.stdout.write(`\r📦 Updated products: ${updatedProducts}/${productEntries.length}`);
        }

        await connection.commit();
        console.log('\n\n✅ Data enrichment completed successfully!');

        // Verify Taxes
        const [taxes] = await connection.query('SELECT * FROM taxes');
        console.log('\n📋 Updated Taxes:');
        console.table(taxes);

    } catch (error) {
        await connection.rollback();
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

enrichData();
