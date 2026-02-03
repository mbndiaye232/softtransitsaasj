require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkNotes() {
    try {
        console.log('Checking notes data...\n');

        // Get all notes
        const [notes] = await pool.query('SELECT * FROM notesdedetails ORDER BY IDNotesDeDetails DESC LIMIT 5');

        console.log(`Found ${notes.length} notes (showing last 5):`);
        notes.forEach((note, i) => {
            console.log(`\n${i + 1}. Note ID: ${note.IDNotesDeDetails}`);
            console.log(`   REPERTOIRE: "${note.REPERTOIRE || '(vide)'}"`);
            console.log(`   NINEA: "${note.NINEA || '(vide)'}"`);
            console.log(`   IDDossiers: ${note.IDDossiers}`);
            console.log(`   DateCreation: ${note.DateCreation}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit(0);
    }
}

checkNotes();
