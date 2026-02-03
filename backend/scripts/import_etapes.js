// Import workflow steps (étapes) from XML into etapesdossiers table
const fs = require('fs');
const xml2js = require('xml2js');
const pool = require('../config/database');

async function importEtapesDossier() {
    try {
        console.log('📖 Reading XML file...');
        const xmlData = fs.readFileSync('../docs/Export etapes dossier.xml', 'utf8');

        console.log('🔄 Parsing XML...');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const etapes = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`Found ${etapes.length} workflow steps to import`);

        console.log('\n🗑️  Clearing existing data...');
        await pool.query('DELETE FROM etapesdossiers');

        console.log('📥 Importing workflow steps...\n');

        for (const etape of etapes) {
            const id = parseInt(etape.IDEtapesDossiers[0]);
            const libelle = etape.libelleEtapesDossiers[0];
            const observations = etape.Observations[0] || null;

            await pool.query(
                `INSERT INTO etapesdossiers (IDEtapesDossiers, libelleEtapesDossiers, Observations)
                 VALUES (?, ?, ?)`,
                [id, libelle, observations]
            );

            console.log(`  ✓ ${id}. ${libelle}`);
        }

        console.log(`\n✅ Successfully imported ${etapes.length} workflow steps!`);

        // Show summary
        const [rows] = await pool.query('SELECT * FROM etapesdossiers ORDER BY IDEtapesDossiers');
        console.log('\n📊 Workflow Steps Summary:');
        console.log('─'.repeat(50));
        rows.forEach(row => {
            console.log(`${row.IDEtapesDossiers}. ${row.libelleEtapesDossiers}`);
        });
        console.log('─'.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing workflow steps:', error);
        process.exit(1);
    }
}

importEtapesDossier();
