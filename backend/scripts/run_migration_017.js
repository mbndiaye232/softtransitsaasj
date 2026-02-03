require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/017_drop_declarations_fk.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration 017...');
        await pool.query(sql);
        console.log('✓ Migration 017 completed: IDDeclarations foreign key dropped');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runMigration();
