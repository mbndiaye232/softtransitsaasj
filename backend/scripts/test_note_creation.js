require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function testNoteCreation() {
    try {
        // First, get a valid dossier ID
        console.log('Fetching a valid dossier...');
        const [dossiers] = await pool.query('SELECT IDDossiers FROM dossiers LIMIT 1');

        if (dossiers.length === 0) {
            console.log('No dossiers found in database');
            process.exit(1);
        }

        const dossierId = dossiers[0].IDDossiers;
        console.log(`Using dossier ID: ${dossierId}`);

        // Try to insert a note
        console.log('\nAttempting to insert note...');
        const [result] = await pool.query(
            'INSERT INTO notesdedetails (IDDossiers, REPERTOIRE, NINEA, CodeProvenance, IdAgent, DateCreation) VALUES (?, ?, ?, ?, ?, NOW())',
            [dossierId, 'TEST', 'TEST123', 'TEST', 1]
        );

        console.log('✓ Note created successfully!');
        console.log('Insert ID:', result.insertId);

        // Clean up - delete the test note
        await pool.query('DELETE FROM notesdedetails WHERE IDNotesDeDetails = ?', [result.insertId]);
        console.log('✓ Test note deleted');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('SQL State:', error.sqlState);
        console.error('Error Code:', error.code);
        if (error.sql) {
            console.error('SQL:', error.sql);
        }
    } finally {
        process.exit(0);
    }
}

testNoteCreation();
