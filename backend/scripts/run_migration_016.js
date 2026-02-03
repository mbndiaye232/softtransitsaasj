require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/016_add_datecreation_to_notes.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration 016...');
        await pool.query(sql);
        console.log('✓ Migration 016 completed: DateCreation added to notesdedetails');
    } catch (error) {
        // If error is duplicate column, it's fine
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('✓ Column already exists (skipped)');
        } else {
            console.error('Migration error:', error);
            process.exit(1);
        }
    } finally {
        process.exit(0);
    }
}

runMigration();
