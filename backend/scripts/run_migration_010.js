require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/010_create_produits_table.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(sql);
        console.log('✓ Migration 010 completed: produits table created');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runMigration();
