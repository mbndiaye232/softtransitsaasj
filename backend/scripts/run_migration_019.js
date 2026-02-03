const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrationFile = path.join(__dirname, '../migrations/019_create_agent_management_tables.sql');

async function runMigration() {
    console.log('Running migration 019...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        await pool.query(sql);
        console.log('Migration 019 executed successfully.');
    } catch (error) {
        console.error('Migration 019 failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
