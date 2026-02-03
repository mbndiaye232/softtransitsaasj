const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigrations() {
    console.log('Running migrations 006 and 007...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        // Migration 006
        console.log('Running 006_add_structur_to_groupes.sql...');
        const sql006 = fs.readFileSync(path.join(__dirname, '../migrations/006_add_structur_to_groupes.sql'), 'utf8');
        await pool.query(sql006);
        console.log('✓ Migration 006 completed');

        // Migration 007
        console.log('Running 007_add_groupe_to_agents.sql...');
        const sql007 = fs.readFileSync(path.join(__dirname, '../migrations/007_add_groupe_to_agents.sql'), 'utf8');
        await pool.query(sql007);
        console.log('✓ Migration 007 completed');

        console.log('\n✅ All migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

runMigrations();
