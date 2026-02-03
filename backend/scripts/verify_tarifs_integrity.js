require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function verifyTarifs() {
    const connection = await pool.getConnection();

    try {
        console.log('🔍 Verifying tariffs data integrity...\n');

        // Total counts
        const [counts] = await connection.query(`
            SELECT 
                (SELECT COUNT(*) FROM tarifs) as total_tarifs,
                (SELECT COUNT(*) FROM taxes) as total_taxes,
                (SELECT COUNT(*) FROM taux) as total_taux,
                (SELECT COUNT(*) FROM produits) as total_produits
        `);
        console.log('📊 Database Counts:');
        console.table(counts[0]);

        // Verify relationships
        console.log('\n🔗 Verifying relationships...');

        // Check for broken links (should be 0 due to FKs)
        const [brokenLinks] = await connection.query(`
            SELECT 
                COUNT(CASE WHEN t.IDTaux IS NULL THEN 1 END) as missing_taux,
                COUNT(CASE WHEN tx.IDTaxes IS NULL THEN 1 END) as missing_taxes,
                COUNT(CASE WHEN p.IDProduits IS NULL THEN 1 END) as missing_produits
            FROM tarifs tr
            LEFT JOIN taux t ON tr.IDTaux = t.IDTaux
            LEFT JOIN taxes tx ON tr.IDTaxes = tx.IDTaxes
            LEFT JOIN produits p ON tr.IDProduits = p.IDProduits
        `);

        if (brokenLinks[0].missing_taux === 0 &&
            brokenLinks[0].missing_taxes === 0 &&
            brokenLinks[0].missing_produits === 0) {
            console.log('✓ All foreign key relationships are valid');
        } else {
            console.log('❌ Broken relationships found:');
            console.table(brokenLinks[0]);
        }

        // Sample product with multiple taxes
        console.log('\n📋 Sample Product Taxes (NTS: 0000010000):');
        const [sampleTaxes] = await connection.query(`
            SELECT 
                p.Libelle,
                p.NTS,
                tr.CodeTaux,
                t.Taux,
                tr.CodeTaxe
            FROM tarifs tr
            JOIN produits p ON tr.IDProduits = p.IDProduits
            JOIN taux t ON tr.IDTaux = t.IDTaux
            WHERE p.NTS = '0000010000'
        `);
        console.table(sampleTaxes);

    } catch (error) {
        console.error('❌ Verification error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

verifyTarifs();
