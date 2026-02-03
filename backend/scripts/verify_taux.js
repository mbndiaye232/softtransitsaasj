require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function verifyTaux() {
    const connection = await pool.getConnection();

    try {
        console.log('🔍 Verifying taux table data...\n');

        // Get total count
        const [countResult] = await connection.query('SELECT COUNT(*) as total FROM taux');
        console.log(`✓ Total records: ${countResult[0].total}`);

        // Get all tax rates grouped by type
        const [allTaux] = await connection.query(`
            SELECT IDTaux, CodeTaux, Taux, IdAgent 
            FROM taux 
            ORDER BY CodeTaux
        `);

        console.log('\n📋 All Tax Rates:');
        console.log('─'.repeat(60));
        console.log('ID\tCode\t\tRate\t\tAgent');
        console.log('─'.repeat(60));
        allTaux.forEach(t => {
            console.log(`${t.IDTaux}\t${t.CodeTaux}\t\t${t.Taux}\t\t${t.IdAgent}`);
        });

        // Group by prefix
        const prefixes = {};
        allTaux.forEach(t => {
            const prefix = t.CodeTaux.match(/^[A-Z]+/)[0];
            if (!prefixes[prefix]) {
                prefixes[prefix] = [];
            }
            prefixes[prefix].push(t);
        });

        console.log('\n📊 Tax Rates by Category:');
        console.log('─'.repeat(60));
        Object.keys(prefixes).sort().forEach(prefix => {
            console.log(`\n${prefix} (${prefixes[prefix].length} rates):`);
            prefixes[prefix].forEach(t => {
                console.log(`  ${t.CodeTaux}: ${t.Taux}%`);
            });
        });

        console.log('\n✓ Verification complete!');

    } catch (error) {
        console.error('❌ Verification error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

verifyTaux();
