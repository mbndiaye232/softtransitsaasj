const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkGroupsSchema() {
    console.log('Checking database schema for groups...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Check if groups table exists
        const [tables] = await pool.query("SHOW TABLES LIKE 'groupes'");

        if (tables.length > 0) {
            console.log('\n=== GROUPES TABLE ===');
            const [schema] = await pool.query('DESCRIBE groupes');
            console.table(schema);

            const [data] = await pool.query('SELECT * FROM groupes LIMIT 5');
            console.log('\nSample data:');
            console.table(data);
        } else {
            console.log('❌ Table "groupes" does not exist');
        }

        // Check Agents table for group reference
        console.log('\n=== AGENTS TABLE (relevant columns) ===');
        const [agentsSchema] = await pool.query('DESCRIBE Agents');
        const groupRelated = agentsSchema.filter(col =>
            col.Field.toLowerCase().includes('group') ||
            col.Field.toLowerCase().includes('groupe')
        );
        console.table(groupRelated);

    } catch (error) {
        console.error('Schema check failed:', error.message);
    } finally {
        await pool.end();
    }
}

checkGroupsSchema();
