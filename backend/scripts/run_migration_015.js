require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/015_create_notes_tables.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split by semicolon to handle multiple statements if pool.query doesn't support it directly
        // But usually mysql2 driver handles it if multipleStatements: true is set. 
        // Let's safe check and split manually if needed, or assume configuration is correct.
        // Given previous migration 010 was a single CREATE TABLE, this one has two.
        // It's safer to read the config/database.js to check for multipleStatements or just split.
        // I'll assume multipleStatements might NOT be on, so I'll execute them one by one.

        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
            await pool.query(statement);
        }

        console.log('✓ Migration 015 completed: notesdedetails and articles tables created');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runMigration();
